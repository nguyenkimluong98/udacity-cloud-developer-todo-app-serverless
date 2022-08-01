import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Form,
  Card,
  Popup
} from 'semantic-ui-react'

import { createTodo, deleteTodo, getTodos, patchTodo } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Todo } from '../types/Todo'

interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  todos: Todo[]
  newTodoName: string
  newTodoDesc: string
  loadingTodos: boolean
}

export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: [],
    newTodoName: '',
    newTodoDesc: '',
    loadingTodos: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoName: event.target.value })
  }

  handleDescChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoDesc: event.target.value })
  }

  onEditButtonClick = (todoId: string) => {
    this.props.history.push(`/todos/${todoId}/edit`)
  }

  onTodoCreate = async () => {
    try {
      if (!this.state.newTodoName || !this.state.newTodoName.trim().length) {
        alert('Fail to create new todo. Please input {todo name}')
        return
      }

      if (!this.state.newTodoDesc || !this.state.newTodoDesc.trim().length) {
        alert('Fail to create new todo. Please input {todo description}')
        return
      }

      const dueDate = this.calculateDueDate()
      const newTodo = await createTodo(this.props.auth.getIdToken(), {
        name: this.state.newTodoName,
        description: this.state.newTodoDesc,
        dueDate
      })
      this.setState({
        todos: [...this.state.todos, newTodo],
        newTodoName: '',
        newTodoDesc: ''
      })
    } catch {
      alert('Todo creation failed')
    }
  }

  onTodoDelete = async (todoId: string) => {
    try {
      await deleteTodo(this.props.auth.getIdToken(), todoId)
      this.setState({
        todos: this.state.todos.filter((todo) => todo.todoId !== todoId)
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  onTodoCheck = async (pos: number, status: number) => {
    try {
      const todo = this.state.todos[pos]
      await patchTodo(this.props.auth.getIdToken(), todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        description: todo.description,
        status
      })
      this.setState({
        todos: update(this.state.todos, {
          [pos]: { status: { $set: status } }
        })
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const todos = await getTodos(this.props.auth.getIdToken())
      this.setState({
        todos,
        loadingTodos: false
      })
    } catch (e) {
      alert(`Failed to fetch todos: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Header icon="book" as="h1">
          YOUR TODOs
        </Header>

        {this.renderCreateTodoInput()}

        {this.renderTodos()}
      </div>
    )
  }

  renderCreateTodoInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Form>
            <Form.Field required>
              <label>Task Name</label>
              <Input
                placeholder="Input your todo name"
                onChange={this.handleNameChange}
              />
            </Form.Field>
            <Form.Field required>
              <label>Description</label>
              <Input
                placeholder="Description it to remember..."
                onChange={this.handleDescChange}
              />
            </Form.Field>
            <Button fluid primary onClick={() => this.onTodoCreate()}>
              <Icon name="save" />
              Create now
            </Button>
          </Form>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTodos() {
    if (this.state.loadingTodos) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList() {
    return (
      <Grid padded>
        {this.state.todos.map((todo, pos) => {
          return (
            <Card key={todo.todoId}>
              <Image src={todo.attachmentUrl} wrapped ui={false} />
              <Card.Content>
                <Card.Meta>
                  <div style={{ textAlign: 'end', marginBottom: '10px' }}>
                    <Button.Group size="tiny">
                      <Button
                        active={![1, 2].includes(todo.status)}
                        inverted
                        color="blue"
                        onClick={() => this.onTodoCheck(pos, 0)}
                      >
                        <Icon name="circle outline" />
                      </Button>
                      <Button.Or />
                      <Button
                        active={todo.status === 1}
                        inverted
                        color="purple"
                        onClick={() => this.onTodoCheck(pos, 1)}
                      >
                        <Icon name="sync" />
                      </Button>
                      <Button.Or />
                      <Button
                        active={todo.status === 2}
                        inverted
                        color="green"
                        onClick={() => this.onTodoCheck(pos, 2)}
                      >
                        <Icon name="check" />
                      </Button>
                    </Button.Group>
                  </div>
                </Card.Meta>
                <Card.Header>{todo.name}</Card.Header>
                <Card.Description>{todo.description}</Card.Description>
              </Card.Content>
              <Card.Content extra>
                <div className="ui two buttons">
                  <Button
                    basic
                    color="purple"
                    onClick={() => this.onEditButtonClick(todo.todoId)}
                  >
                    <Icon name="pencil" />
                    Edit
                  </Button>
                  <Button
                    basic
                    color="red"
                    onClick={() => this.onTodoDelete(todo.todoId)}
                  >
                    <Icon name="delete" />
                    Delete
                  </Button>
                </div>
              </Card.Content>
            </Card>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
