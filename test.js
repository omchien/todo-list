const myPromise = Promise.resolve('Promise!');

function funcOne() {
  myPromise.then((res) => console.log(res));
  setTimeout(() => console.log('Timeout1'), 1000);

  console.log('Last line 1!');
}

function funcTwo() {
  setTimeout(() => console.log('Timeout2'), 500);

  console.log('Last line 2!');
}

funcOne();
funcTwo();
