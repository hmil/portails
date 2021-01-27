const message = 'Hello TypeScript!';

export function sayHello() {
    console.log(message);
    
    const messageElement = document.createElement('p');
    messageElement.innerText = message;
    document.body.append(messageElement);
}