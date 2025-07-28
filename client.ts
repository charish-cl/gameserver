

//学习ts基本语法
// 显式类型注解
let isActive: boolean = true;
let score: number = 100;
let playerName: string = "Link";

// 数组（两种写法）
let items: number[] = [1, 2, 3];
let enemies: Array<string> = ["Bokoblin", "Lynel"];

// 元组（固定长度和类型）
let position: [number, number] = [10, 20];

let s:string = "";

position.map((value) => {
    s += value + " ";
})



// 联合类型：变量可接受多种类型
type WeaponType = "Sword" | "Bow" | "Staff";
let primaryWeapon: WeaponType = "Sword";

// console.log(primaryWeapon);

// 相当于 C# 枚举
const enum Direction { Up, Down, Left, Right }
let move: Direction = Direction.Up;

// console.log(move);

// 接口定义
interface ICharacter {
    health: number;
    attack(): void;
}

// 类实现接口
class Player implements ICharacter {
    constructor(public health: number) {} // 简写：自动生成字段

    // 方法（无需访问修饰符默认为 public）
    attack() {
        console.log("health: " + this.health);
        console.log("Swing sword!");
    }

    // 属性（getter/setter）
    private _level: number = 1;
    get level(): number {
        return this._level;
    }
    set level(value: number) {
        if (value > 0) this._level = value;
    }
}

let player : Player = new Player(100);

// player.level = -1;
// console.log(player.level);
//
// player.level = 2;
// console.log(player.level);
//
// let character: ICharacter = player as ICharacter;
// character.attack();

// 泛型函数
function AddComponent<T>(entity: T): T {
    console.log(`Adding component to ${typeof entity}`);
    return entity;
}

// 泛型类
class Inventory<T> {
    private items: T[] = [];
    add(item: T) {
        this.items.push(item);
    }
}

// 使用
const numInventory = new Inventory<number>();

// AddComponent(Player);


const uniqueIds = new Set<number>();

// 添加
uniqueIds.add(1001);
uniqueIds.add(1002);
uniqueIds.add(1001); // 重复值被忽略

// console.log(uniqueIds.size); // 2
// console.log(uniqueIds.has(1002)); // true
//
// uniqueIds.forEach((value) => {
//     console.log(value);
// })
// 转换为数组
const idArray = Array.from(uniqueIds); // [1001, 1002]
let filteredArray = idArray.filter((value) => {
    return value >= 1002;
})
filteredArray.forEach((value) => {console.log(value);})


const inventory = new Map<string, number>();
inventory.set("apple", 5);
inventory.set("banana", 3);
inventory.set("apple", 7); // 更新值
// inventory.forEach((value) => {
//     console.log(value);
// })


function first() {
    console.log("first(): factory evaluated");
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("first(): called");
    };
}

function second() {
    console.log("second(): factory evaluated");
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("second(): called");
    };
}
function enumerable(value: boolean) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.enumerable = value;

    };
}
class Greeter {
    greeting: string;
    constructor(message: string) {
        this.greeting = message;
    }

    @enumerable(false)
    greet() {
        return "Hello, " + this.greeting;
    }
}

const greeter = new Greeter("world");
console.log(greeter.greet()); // "Hello, world"
// class ExampleClass {
//     @first()
//     @second()
//     method() {}
// }



class Sprite {
    name = "";
    x = 0;
    y = 0;

    constructor(name: string) {
        this.name = name;
    }
}
// To get started, we need a type which we'll use to extend
// other classes from. The main responsibility is to declare
// that the type being passed in is a class.

type Constructor = new (...args: any[]) => {};

// This mixin adds a scale property, with getters and setters
// for changing it with an encapsulated private property:

function Scale<TBase extends Constructor>(Base: TBase) {
    return class Scaling extends Base {
        // Mixins may not declare private/protected properties
        // however, you can use ES2020 private fields
        _scale = 1;

        setScale(scale: number) {
            this._scale = scale;
        }

        get scale(): number {
            return this._scale;
        }
    };
}

// Compose a new class from the Sprite class,
// with the Mixin Scale applier:
const EightBitSprite = Scale(Sprite);

const flappySprite = new EightBitSprite("Bird");
flappySprite.setScale(0.8);
console.log(flappySprite.scale);

class A{
    protected a:number;
    constructor(a:number)
    {
        this.a = a;
    }
}
class B{
    public readonly b:number;
    constructor(b:number)
    {
        this.b = b;
    }
}

let  b1 = new B(1);


let arr = [1,2,3];
let obj: any = { x: 0 };
const  b = { x: 0 }

b.x = 1;
console.log(b.x);