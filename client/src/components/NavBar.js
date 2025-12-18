import React, { useContext } from "react";
import { Context } from "..";
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { NavLink } from "react-router-dom";
import { observer } from "mobx-react-lite";

const NavBar = observer(() => {
    const {user} = useContext(Context);

    const logOut = () => {
      user.setUser({});
      user.setIsAuth(false);
      localStorage.removeItem('token');
    }

    return (
        <Navbar expand="lg" className="bg-body-tertiary">
          <Container fluid>
            <NavLink to={'/videos'} style={{textDecoration: "none"}}>
              <Navbar.Brand style={{color: "red"}}>FreeVideos</Navbar.Brand>
            </NavLink>
            <Navbar.Toggle aria-controls="navbarScroll" />
            <Navbar.Collapse id="navbarScroll">
              <Nav className="me-auto">
                {/* <Nav.Link href="#action1"></Nav.Link> */}
                {/* <Nav.Link href="#action2">Link</Nav.Link> */}
              </Nav>

              <Form className="d-flex mx-auto">
                <Form.Control
                  type="search"
                  placeholder="Поиск"
                  className="me-2"
                  aria-label="Search"
                  />
                <Button variant="outline-success">Поиск</Button>
              </Form>

              <Nav className="ms-auto">
                {user.isAuth ? 
                <>
                    <NavLink to={'/profile'}>
                      <Button className="me-2">{user.user.username || user.user.email}</Button>
                    </NavLink>
                    <NavLink to={'/videos'}>
                      <Button variant="outline-danger" onClick={logOut}>Выйти</Button>
                    </NavLink>
                </>
                :
                <NavLink to={'/login'}>
                  <Button>
                    Авторизация
                  </Button>
                </NavLink>
                } 
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
    );
});

export default NavBar;
