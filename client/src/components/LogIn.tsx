import * as React from 'react'
import Auth from '../auth/Auth'
import { Button, Grid, Header, Image } from 'semantic-ui-react'

interface LogInProps {
  auth: Auth
}

interface LogInState {}

export class LogIn extends React.PureComponent<LogInProps, LogInState> {
  onLogin = () => {
    this.props.auth.login()
  }

  render() {
    return (
      <Grid textAlign="center" verticalAlign="middle">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h2" color="teal" textAlign="center">
            <Image src="/logo.png" /> Log-in to your account TODOs
          </Header>
          <Button color="teal" fluid size="large" onClick={this.onLogin}>
            Login
          </Button>
        </Grid.Column>
      </Grid>
    )
  }
}
