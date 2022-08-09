function handleTodoFormSubmit(event) {
  event.preventDefault();

  const todoForm = document.getElementById('todoFormId');
  if (!todoForm) return;

  // get form value
  const todoInput = todoForm.querySelector('input[name=todoText]');
  if (!todoInput || todoInput.value === '') return;
  const todoStatus = todoForm.querySelector('.form-check-input');
  if (!todoStatus) return;
  const checkLabel = todoForm.querySelector('.form-check-label');
  if (!checkLabel) return;

  // determine add or edit mode
  const isEdit = Boolean(todoForm.dataset.id);

  // get todo list
  const todoList = getTodoList();

  if (isEdit) {
    const index = todoList.findIndex((x) => x.id === +todoForm.dataset.id);
    if (index < 0) return;

    // update from localStorage
    todoList[index].title = todoInput.value;
    todoList[index].status = checkLabel.textContent.toLocaleLowerCase();
    localStorage.setItem('todo_list', JSON.stringify(todoList));

    // update from dom
    const liElement = document.querySelector(`#todo-list > li[data-id="${todoForm.dataset.id}"]`);
    if (liElement) {
      const titleElement = liElement.querySelector('.todo__title');
      if (titleElement) titleElement.textContent = todoInput.value;

      // update data-status li element
      liElement.dataset.status = checkLabel.textContent.toLocaleLowerCase();

      // update alert class
      const divElement = liElement.querySelector('div.todo');
      const newAlertClass =
        checkLabel.textContent.toLocaleLowerCase() === 'pending'
          ? 'alert-secondary'
          : 'alert-success';
      divElement.classList.remove('alert-secondary', 'alert-success');
      divElement.classList.add(newAlertClass);

      // update btn class
      const finishBtn = liElement.querySelector('button.finish');
      const newBtnClass =
        checkLabel.textContent.toLocaleLowerCase() === 'pending' ? 'btn-success' : 'btn-dark';
      finishBtn.classList.remove('btn-dark', 'btn-success');
      finishBtn.classList.add(newBtnClass);
      finishBtn.textContent =
        checkLabel.textContent.toLocaleLowerCase() === 'pending' ? 'Finish' : 'Reset';
    }
  } else {
    const newTodo = {
      id: Date.now(),
      title: todoInput.value,
      status: todoStatus.checked ? 'complete' : 'pending',
    };

    // update from localStorage
    todoList.push(newTodo);
    localStorage.setItem('todo_list', JSON.stringify(todoList));

    // update from dom
    const newLiElement = createTodoElement(newTodo);
    const ulElement = document.getElementById('todo-list');
    if (!ulElement) return;
    ulElement.appendChild(newLiElement);
  }

  // reset form
  delete todoForm.dataset.id;
  todoForm.reset();
  todoStatus.checked = false;
  checkLabel.textContent = 'Pending';
}

function handleCheckForm() {
  const todoForm = document.getElementById('todoFormId');
  if (!todoForm) return;

  const isCheck = todoForm.querySelector('.form-check-input').checked;
  const label = todoForm.querySelector('.form-check-label');
  label.textContent = isCheck ? 'Complete' : 'Pending';
}

function getAllTodoElements() {
  return document.querySelectorAll('#todo-list > li');
}

function isMatchSearch(liElement, searchTerm) {
  if (!liElement) return false;

  if (searchTerm === '') return true;

  const titleElement = liElement.querySelector('p.todo__title');
  if (!titleElement) return false;

  return titleElement.textContent.toLowerCase().includes(searchTerm.toLowerCase());
}

function isMatchStatus(liElement, filterStatus) {
  return filterStatus === 'all' || liElement.dataset.status === filterStatus;
}

function isMatch(liElement, params) {
  return (
    isMatchSearch(liElement, params.get('searchTerm')) &&
    isMatchStatus(liElement, params.get('status'))
  );
}

function handleFilterChange(filterName, filterValue) {
  // update query params
  const url = new URL(window.location);
  url.searchParams.set(filterName, filterValue);
  history.pushState({}, '', url);

  const todoElementList = getAllTodoElements();

  for (const todoElement of todoElementList) {
    const needToShow = isMatch(todoElement, url.searchParams);
    todoElement.hidden = !needToShow;
  }
}

function initSearchInput(params) {
  const searchInput = document.getElementById('searchTerm');
  if (!searchInput) return;

  if (params.get('searchTerm')) searchInput.value = params.get('searchTerm');

  searchInput.addEventListener('input', () => {
    handleFilterChange('searchTerm', searchInput.value);
  });
}

function initFilterStatus(params) {
  const filterStatusSelect = document.getElementById('filterStatus');
  if (!filterStatusSelect) return;

  if (params.get('status')) filterStatusSelect.value = params.get('status');

  filterStatusSelect.addEventListener('change', () => {
    handleFilterChange('status', filterStatusSelect.value);
  });
}

function createTodoElement(todo, params) {
  if (!todo) return null;

  // find template
  const todoTemplate = document.getElementById('todoTemplate');
  if (!todoTemplate) return;

  // clone li element
  const todoElement = todoTemplate.content.firstElementChild.cloneNode(true);
  todoElement.dataset.id = todo.id;
  todoElement.dataset.status = todo.status;

  // render todo status
  const divElement = todoElement.querySelector('div.todo');
  if (!divElement) return null;

  const alertClass = todo.status === 'pending' ? 'alert-secondary' : 'alert-success';
  divElement.classList.add(alertClass);

  // render btn status
  const finishBtn = todoElement.querySelector('button.finish');
  if (!finishBtn) return null;

  const btnClass = todo.status === 'pending' ? 'btn-success' : 'btn-dark';
  finishBtn.classList.add(btnClass);
  finishBtn.textContent = todo.status === 'pending' ? 'Finish' : 'Reset';

  // update todo content
  const titleElement = todoElement.querySelector('.todo__title');
  if (titleElement) titleElement.textContent = todo.title;

  // check if show todo element
  todoElement.hidden = !isMatch(todoElement, params);

  // attach events for btn
  // finish btn
  finishBtn.addEventListener('click', function () {
    const currentStatus = todoElement.dataset.status;
    const newStatus = currentStatus === 'pending' ? 'complete' : 'pending';

    // update from localStorage
    const todoList = getTodoList();
    const index = todoList.findIndex((item) => item.id === todo.id);
    if (index >= 0) {
      todoList[index].status = newStatus;
      localStorage.setItem('todo_list', JSON.stringify(todoList));
    }

    // update data-status li element
    todoElement.dataset.status = newStatus;

    // update alert class
    const newAlertClass = currentStatus === 'pending' ? 'alert-success' : 'alert-secondary';
    divElement.classList.remove('alert-secondary', 'alert-success');
    divElement.classList.add(newAlertClass);

    // update btn class
    const newBtnClass = currentStatus === 'pending' ? 'btn-dark' : 'btn-success';
    finishBtn.classList.remove('btn-dark', 'btn-success');
    finishBtn.classList.add(newBtnClass);
    finishBtn.textContent = currentStatus === 'pending' ? 'Reset' : 'Finish';
  });

  // edit btn
  const editBtn = todoElement.querySelector('button.edit');
  if (editBtn) {
    editBtn.addEventListener('click', function () {
      const todoForm = document.getElementById('todoFormId');
      if (!todoForm) return;
      const isCheck = todoForm.querySelector('.form-check-input');
      const label = todoForm.querySelector('.form-check-label');

      todoForm.dataset.id = todo.id;

      // get latest todo
      const todoList = getTodoList();
      const latestTodo = todoList.find((x) => x.id === todo.id);
      if (!latestTodo) return;

      todoForm.dataset.status = latestTodo.status;

      const todoInput = todoForm.querySelector('input[name=todoText]');
      if (!todoInput) return;

      // update from dom
      todoInput.value = latestTodo.title;
      isCheck.checked = latestTodo.status === 'complete' ? true : false;
      label.textContent = latestTodo.status[0].toUpperCase() + latestTodo.status.slice(1);
    });
  }

  // remove btn
  const removeBtn = todoElement.querySelector('button.remove');
  if (removeBtn)
    removeBtn.addEventListener('click', function () {
      // save from localStorage
      const todoList = getTodoList();
      const newTodoList = todoList.filter((item) => item.id !== todo.id);
      window.localStorage.setItem('todo_list', JSON.stringify(newTodoList));

      // remove from dom
      todoElement.remove();
    });

  return todoElement;
}

function renderTodoList(todoList, ulElementId, params) {
  if (!Array.isArray(todoList) || todoList.length === 0) return;

  const ulElement = document.getElementById(ulElementId);
  if (!ulElement) return;

  for (const todo of todoList) {
    const liElement = createTodoElement(todo, params);
    ulElement.appendChild(liElement);
  }
}

function getTodoList() {
  try {
    return JSON.parse(window.localStorage.getItem('todo_list')) || [];
  } catch {
    return [];
  }
}

(() => {
  // get query params object
  const params = new URLSearchParams(window.location.search);

  renderTodoList(getTodoList(), 'todo-list', params);
  initSearchInput(params);
  initFilterStatus(params);

  const todoForm = document.getElementById('todoFormId');
  if (todoForm) {
    todoForm.addEventListener('submit', handleTodoFormSubmit);
  }

  const checkForm = todoForm.querySelector('.form-check');
  if (checkForm) {
    checkForm.addEventListener('click', handleCheckForm);
  }
})();
