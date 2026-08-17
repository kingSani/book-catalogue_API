type Address = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
};
type Person = {
  name: string;
  age: number;
  isStudent: boolean;
  address?: Address;
};

let people: Person[] = [
  {
    name: "Alice",
    age: 30,
    isStudent: false,
    address: {
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zipCode: "12345",
    },
  },
];
type Order = {
  id: number;
  status: string;
  food: Food;
};
type Food = {
  name: string;
  price: number;
};

const menu = [
  { name: "Pizza", price: 12.99 },
  { name: "Burger", price: 8.99 },
  { name: "Salad", price: 6.99 },
];

let cashInRegister: number = 100.0;
const orderQueue = [];
let nextOrderId: number = 1;

function addNewFood(food: Food) {
  menu.push(food);
}

function placeOrder(foodName: string) {
  const food = menu.find((food) => food.name === foodName);
  if (food) {
    cashInRegister += food.price;
    console.log(
      `Order placed for ${food.name}. Total cash in register: $${cashInRegister.toFixed(2)}`,
    );
    const newOrder: Order = { id: nextOrderId++, status: "ordered", food };
    orderQueue.push(newOrder);
  }
}

addNewFood({ name: "Pasta", price: 10.99 });
addNewFood({ name: "Sushi", price: 14.99 });
addNewFood({ name: "Taco", price: 5.99 });
