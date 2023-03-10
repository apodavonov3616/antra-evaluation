//done
const APIs = (() => {

    const url = 'http://localhost:3000';
    const path1 = "todos";

    const fetchAllTodos = () => {
        return fetch([url, path1].join("/"))
            .then((response) => response.json())
            .catch((err) => console.log(err));
    };

    const postTodo = (newTodo) => {
        return fetch([url, path1].join("/"), {
            method: "POST",
            body: JSON.stringify(newTodo),
            headers: { "Content-Type": "application/json" },
        })
            .then((response) => response.json())
            .catch((err) => console.log(err));
    };

    const editTodo = (id, content, isCompleted) => {
        return fetch([url, path1, id].join("/"), {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content: content.content,
                isCompleted: isCompleted

            })
        }).then((res) => {
            return res.json()
        })
    };

    const deleteTodo = (id) => {
        return fetch([url, path1, id].join("/"), {
            method: "DELETE",
        })
            .then((response) => response.json())
            .catch((err) => console.log(err));
    };

    return { postTodo, deleteTodo, fetchAllTodos, editTodo };
})();

const Model = (() => {
    class State {
        #todos; //private field
        #onChange; //function, will be called when setter function todos is called
        constructor() {
            this.#todos = [];
        }
        get todos() {
            return this.#todos;
        }
        set todos(newTodos) {
            // reassign value
            // console.log("setter function");
            this.#todos = newTodos;
            this.#onChange?.(); // rendering
        }

        subscribe(callback) {
            //subscribe to the change of the state todos
            this.#onChange = callback;
        }
    }
    const { fetchAllTodos, postTodo, deleteTodo, editTodo } = APIs;
    return {
        State,
        fetchAllTodos,
        postTodo,
        deleteTodo,
        editTodo
    };
})();

const View = (() => {
    const pendingTodoList = document.querySelector(".pending-todo-list");
    const compeletedTodoList = document.querySelector(".completed-todo-list");
    const submitBtnEl = document.querySelector(".submit-btn");
    const editBtnEl = document.querySelector(".edit-btn");
    const inputElement = document.querySelector(".input");
    const switchEl = document.querySelector(".switch-btn")

    const renderTodos = (todos) => {
        let pendingTodosTemplate = "";
        let compeletedTodosTemplate = "";
        todos.forEach((todo) => {
            const liTemplate = `<li><input value="${todo.content}" class="task-input" id="${todo.id}"/><button class="delete-btn" id="${todo.id}">delete</button></li>
            <button class="edit-btn" id="${todo.id}">edit</button>
            <button class="switch-btn" id="${todo.id}">switch</button>`;
            if (todo.isCompleted) {
                compeletedTodosTemplate += liTemplate
            } else {
                pendingTodosTemplate += liTemplate
            }
        });
        if (todos.length === 0) {
            pendingTodosTemplate = "<h4>no task to display!</h4>";
        }
        pendingTodoList.innerHTML = pendingTodosTemplate;
        compeletedTodoList.innerHTML = compeletedTodosTemplate
    };

    const clearInput = () => {
        inputElement.value = "";
    };

    return { renderTodos, submitBtnEl, editBtnEl, inputElement, clearInput, pendingTodoList, compeletedTodoList, switchEl };
})();

const Controller = ((view, model) => {
    const state = new model.State();
    const init = () => {
        model.fetchAllTodos().then((todos) => {
            todos.reverse();
            state.todos = todos;
        });
    };

    const addToPendingList = () => {
        view.submitBtnEl.addEventListener("click", (event) => {
            /* 
                1. read the value from input
                2. post request
                3. update view
            */
            const inputValue = view.inputElement.value;
            model.postTodo({ content: inputValue, isCompleted: false }).then((data) => {
                state.todos = [data, ...state.todos];
                view.clearInput();
            });
        });
    };

    const handleDelete = () => {
        //event bubbling
        /* 
            1. get id
            2. make delete request
            3. update view, remove
        */
        view.pendingTodoList.addEventListener("click", (event) => {
            if (event.target.className === "delete-btn") {
                const id = event.target.id;
                // console.log("id", typeof id);
                console.log('inner delete function')
                model.deleteTodo(+id).then((data) => {
                    state.todos = state.todos.filter((todo) => todo.id !== +id);
                });
            }
        });
        view.compeletedTodoList.addEventListener("click", (event) => {
            if (event.target.className === "delete-btn") {
                const id = event.target.id;
                // console.log("id", typeof id);
                console.log('inner delete function')
                model.deleteTodo(+id).then((data) => {
                    state.todos = state.todos.filter((todo) => todo.id !== +id);
                });
            }
        });
    };

    const handleEdit = () => {
        //event bubbling
        /* 
            1. get id
            2. make delete request
            3. update view, remove
        */
        ///////////////////////////////////////
        view.pendingTodoList.addEventListener("click", (event) => {
            if (event.target.className === "edit-btn") {
                const id = event.target.id;
                let todoInput = null;
                Array.from(document.getElementsByClassName('task-input')).forEach(todo => {
                    if (todo.id === id) {
                        todoInput = todo
                    }
                })

                model.editTodo(+id, { content: todoInput.value }, false).then((data) => {
                    let newState = state.todos.map(todo => {
                        if (todo.id === data.id) {
                            return data
                        } else {
                            return todo
                        }
                    })
                    state.todos = newState
                    // edit works and updates state with new array
                });
            }

            if (event.target.className === "switch-btn") {
                const id = event.target.id;
                let todoInput = null;
                Array.from(document.getElementsByClassName('task-input')).forEach(todo => {
                    if (todo.id === id) {
                        todoInput = todo
                    }
                })

                model.editTodo(+id, { content: todoInput.value }, true).then((data) => {
                    let newState = state.todos.map(todo => {
                        if (todo.id === data.id) {
                            return data
                        } else {
                            return todo
                        }
                    })
                    state.todos = newState
                    // edit works and updates state with new array
                });
            }
        });

        view.compeletedTodoList.addEventListener("click", (event) => {
            if (event.target.className === "edit-btn") {
                const id = event.target.id;
                let todoInput = null;
                Array.from(document.getElementsByClassName('task-input')).forEach(todo => {
                    if (todo.id === id) {
                        todoInput = todo
                    }
                })

                model.editTodo(+id, { content: todoInput.value }, true).then((data) => {
                    let newState = state.todos.map(todo => {
                        if (todo.id === data.id) {
                            return data
                        } else {
                            return todo
                        }
                    })
                    state.todos = newState
                    // edit works and updates state with new array
                });
            }

            if (event.target.className === "switch-btn") {
                const id = event.target.id;
                let todoInput = null;
                Array.from(document.getElementsByClassName('task-input')).forEach(todo => {
                    if (todo.id === id) {
                        todoInput = todo
                    }
                })

                model.editTodo(+id, { content: todoInput.value }, false).then((data) => {
                    let newState = state.todos.map(todo => {
                        if (todo.id === data.id) {
                            return data
                        } else {
                            return todo
                        }
                    })
                    state.todos = newState
                    // edit works and updates state with new array
                });
            }
        });


    };

    // const switchLists = () => {
    //     view.submitBtnEl.addEventListener("click", (event) => {
    //         /* 
    //             1. read the value from input
    //             2. post request
    //             3. update view
    //         */
    //         const inputValue = view.inputElement.value;
    //         model.postTodo({ content: inputValue, isComplete: false }).then((data) => {
    //             state.todos = [data, ...state.todos];
    //             view.clearInput();
    //         });
    //     });
    //     view.pendingTodoList.addEventListener("click", (event) => {
    //         if (event.target.className === "switch-btn") {
    //             const id = event.target.id;
    //             console.log('inner switch function')
    //             // model.deleteTodo(+id).then((data) => {
    //             //     state.todos = state.todos.filter((todo) => todo.id !== +id);
    //             // }); UPDATE HERE FROM COMPLETE TO NOT COMPLETE
    //         }
    //     });
    // };

    const bootstrap = () => {
        init();
        addToPendingList();
        handleDelete();
        handleEdit();
        state.subscribe(() => {
            view.renderTodos(state.todos);
        });
    };
    return {
        bootstrap,
    };
})(View, Model); //ViewModel

Controller.bootstrap();
