import { cloneTemplate } from "/TodoList/dom.js" 
import { createElement } from "/TodoList/dom.js" 

/**
 * @typedef {object} Todo
 * @property {number} id
 * @property {string} title
 * @property {boolean} completed
 */
export class TodoList {
    /** @type {Todo[]} */
    #todos = []

    /** @type {HTMLUListElement} */
    #listElement = []


    /**
     * 
     * @param {Todo[]} todos 
     */
    constructor (todos) {
        this.#todos = todos
    }

    /**
     * 
     * @param {HTMLElement} element 
     */
    appendTo (element) {
        element.append (
            cloneTemplate('todolist-layout')
        )
        this.#listElement = element.querySelector('.list-group')
        for (let todo of this.#todos) {
            const t = new TodoListItem(todo)
            t.prependTo(this.#listElement)
        }

        element.querySelector('form').addEventListener('submit', e => this.onSubmit(e))
        element.querySelectorAll('.btn-group button').forEach(button => {
           button.addEventListener('click', e => this.#toggleFilter(e)) 
        })
        this.#listElement.addEventListener('delete', ({detail: todo}) => {
            this.#todos = this.#todos.filter(t => t !== todo)
            this.#onUpdate()
        })
        this.#listElement.addEventListener('toggle', ({detail: todo}) => {
            todo.completed = !todo.completed
            this.#onUpdate()
        })
    }

    onSubmit (e) {
        e.preventDefault()
        const form = e.currentTarget
        const title = new FormData(e.currentTarget).get('title').toString().trim()
        if (title === '') {
            return
        }
        const todo = {
            id: Date.now(),
            title,
            completed: false
        }
        const item = new TodoListItem(todo)
        item.prependTo(this.#listElement)
        this.#todos.push(todo)
        this.#onUpdate()
        form.reset()
    }

    #onUpdate () {
        localStorage.setItem('todos', JSON.stringify(this.#todos))
    }
    

    #toggleFilter (e) {
        e.preventDefault()
        const filter = e.currentTarget.getAttribute('data-filter')
        e.currentTarget.parentElement.querySelector('.active').classList.remove('active')
        e.currentTarget.classList.add('active')
        if (filter === 'todo') {
            this.#listElement.classList.add('hide-completed')
            this.#listElement.classList.remove('hide-todo')
        } else if (filter === 'done') {
            this.#listElement.classList.add('hide-todo')
            this.#listElement.classList.remove('hide-completed')
        } else {
            this.#listElement.classList.remove('hide-todo')
            this.#listElement.classList.remove('hide-completed')
        }
    }
}

class TodoListItem {
    #element
    #todo
    
    /** @type {Todo} */
    constructor (todo) {
        this.#todo = todo
        const id = `todo-${todo.id}`
        const li = createElement('li', {
            class: 'todo list-group-item d-flex align-items-center',
        })
        this.#element = li
        const checkbox = createElement('input', {
            type: 'checkbox',
            class: 'form-check-input',
            id,
            checked: todo.completed ? '' : null
        })
        const label = createElement('label', {
            class: 'ms-2 form-check-label',
            for: id
        })
        label.innerText = todo.title
        const button = createElement('button', {
            class: 'ms-auto btn btn-danger btn-sm'
        })
        button.innerHTML = '<i class="bi-trash"></i>'
        li.append(checkbox)
        li.append(label)
        li.append(button)
        this.toggle(checkbox)

        button.addEventListener('click', e => this.remove(e))
        checkbox.addEventListener('change', e => this.toggle(e.currentTarget))

        this.#element.addEventListener('delete', e => {
            
        })

    }

    /**
     * @type {HTMLElement} element
     */

    prependTo (element) {
        element.prepend(this.#element)
    }

    /**
     * 
     * @param {PointerEvent} e 
     */
    remove (e) {
        e.preventDefault()
        const event = new CustomEvent('delete', {
            detail: this.#todo,
            bubbles: true,
            cancelable: true
        })
        this.#element.dispatchEvent(event)
        if (event.defaultPrevented) {
            return
        }
        this.#element.remove()
    }

    /**
     * change l'etat de la tache
     * @param {HTMLInputElement} checkbox 
     */
    toggle (checkbox) {
        if (checkbox.checked) {
            this.#element.classList.add('is-completed')
        } else {
            this.#element.classList.remove('is-completed')
        }
        const event = new CustomEvent('toggle', {
            detail: this.#todo,
            bubbles: true
        })
        this.#element.dispatchEvent(event)
    }
}
