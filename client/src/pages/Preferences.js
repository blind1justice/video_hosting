import { observer } from "mobx-react-lite";
import React, { useState, useEffect } from "react";
import { 
  Container, 
  Card, 
  Form, 
  Button, 
  Row, 
  Col,
  ToggleButtonGroup,
  ToggleButton,
  Spinner,
  Alert
} from "react-bootstrap";
import { get_me } from "../http/userAPI";
import { change_preferences } from "../http/preferences";

const Preferences = observer(() => {
  const [userPreferences, setUserPreferences] = useState(null); // Изменяем на null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserPreferences();
  }, []);

  const fetchUserPreferences = async () => {
    try {
      setLoading(true);
      const data = await get_me();
      setUserPreferences(data.user_preferences);
      setError(null);
    } catch (err) {
      console.error("Ошибка загрузки настроек:", err);
      setError("Не удалось загрузить настройки. Используются настройки по умолчанию.");
      setUserPreferences({
        autoplay: false,
        language: "RUSSIAN",
        notifications_enabled: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChange = (key) => {
    setUserPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleLanguageChange = (lang) => {
    setUserPreferences(prev => ({
      ...prev,
      language: lang
    }));
  };

  const handleSave = async () => {
    try {
      await change_preferences(userPreferences);
      console.log("Сохранение настроек:", userPreferences);
      alert("Настройки сохранены успешно!");
    } catch (err) {
      console.error("Ошибка сохранения:", err);
      alert("Не удалось сохранить настройки");
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center align-items-center min-vh-50">
          <Col xs={12} md={6} lg={4} className="text-center">
            <div className="d-flex flex-column align-items-center">
              <Spinner 
                animation="border" 
                variant="primary" 
                role="status"
                style={{ width: '4rem', height: '4rem' }}
              >
                <span className="visually-hidden">Загрузка...</span>
              </Spinner>
              <h4 className="mt-4 text-primary">Загрузка настроек</h4>
              <p className="text-muted mt-2">Пожалуйста, подождите...</p>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error && !userPreferences) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <Alert variant="danger" className="shadow-sm">
              <Alert.Heading className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Ошибка загрузки
              </Alert.Heading>
              <p>{error}</p>
              <hr />
              <div className="d-flex justify-content-end">
                <Button 
                  variant="outline-danger" 
                  onClick={fetchUserPreferences}
                  className="d-flex align-items-center"
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Повторить попытку
                </Button>
              </div>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!userPreferences) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6} className="text-center">
            <div className="p-5 bg-light rounded shadow-sm">
              <i className="bi bi-gear text-muted" style={{ fontSize: '4rem' }}></i>
              <h4 className="mt-4 text-muted">Настройки недоступны</h4>
              <p className="text-muted mt-2">
                Не удалось загрузить настройки пользователя
              </p>
              <Button 
                variant="primary" 
                onClick={fetchUserPreferences}
                className="mt-3"
              >
                Попробовать снова
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          {error && (
            <Alert variant="warning" className="mb-3">
              <i className="bi bi-info-circle me-2"></i>
              {error}
            </Alert>
          )}
          
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0 d-flex align-items-center">
                <i className="bi bi-sliders me-2"></i>
                Настройки
              </h4>
            </Card.Header>
            <Card.Body>
              {/* Автовоспроизведение */}
              <Form.Group className="mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Form.Label className="fw-bold">Автовоспроизведение</Form.Label>
                    <p className="text-muted small mb-0">
                      Автоматически воспроизводить следующий контент
                    </p>
                  </div>
                  <Form.Check
                    type="switch"
                    id="autoplay-switch"
                    checked={userPreferences.autoplay}
                    onChange={() => handleToggleChange("autoplay")}
                    className="custom-switch-lg"
                  />
                </div>
              </Form.Group>

              {/* Язык */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Язык интерфейса</Form.Label>
                <ToggleButtonGroup
                  type="radio"
                  name="language"
                  value={userPreferences.language}
                  onChange={handleLanguageChange}
                  className="w-100 mt-2"
                >
                  <ToggleButton
                    id="lang-ru"
                    value="RUSSIAN"
                    variant={userPreferences.language === "RUSSIAN" ? "primary" : "outline-primary"}
                    className="flex-fill py-2"
                  >
                    Русский
                  </ToggleButton>
                  <ToggleButton
                    id="lang-en"
                    value="ENGLISH"
                    variant={userPreferences.language === "ENGLISH" ? "primary" : "outline-primary"}
                    className="flex-fill py-2"
                  >
                    English
                  </ToggleButton>
                </ToggleButtonGroup>
              </Form.Group>

              {/* Уведомления */}
              <Form.Group className="mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Form.Label className="fw-bold">Уведомления</Form.Label>
                    <p className="text-muted small mb-0">
                      Получать уведомления о новых событиях
                    </p>
                  </div>
                  <Form.Check
                    type="switch"
                    id="notifications-switch"
                    checked={userPreferences.notifications_enabled}
                    onChange={() => handleToggleChange("notifications_enabled")}
                    className="custom-switch-lg"
                  />
                </div>
              </Form.Group>

              {/* Кнопка сохранения */}
              <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={handleSave}
                  className="d-flex align-items-center"
                >
                  <i className="bi bi-check-circle me-2"></i>
                  Сохранить настройки
                </Button>
              </div>
            </Card.Body>
            <Card.Footer className="text-muted small">
              <div className="d-flex align-items-center">
                <i className="bi bi-info-circle me-2"></i>
                Настройки будут применены после сохранения
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
});

export default Preferences;
