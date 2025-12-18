import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { Card, Button, Row, Col, Spinner, Alert, Container } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { mark_report_rejected, mark_report_resolved, fetch_reports } from "../http/reportAPI";

const Reports = observer(() => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await fetch_reports();
      setReports(data);
    } catch (e) {
      setError("Ошибка загрузки жалоб");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId) => {
    try {
      await mark_report_resolved(reportId);
      // Просто убираем жалобу из списка, без перезагрузки
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (e) {
      alert("Ошибка при принятии жалобы");
    }
  };

  const handleReject = async (reportId) => {
    try {
      await mark_report_rejected(reportId);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (e) {
      alert("Ошибка при отклонении жалобы");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center my-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (reports.length === 0) {
    return (
      <Container className="my-5">
        <Alert variant="info" className="text-center">
          Нет активных жалоб
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h2 className="mb-5 text-center">Жалобы на видео</h2>

      <Row className="justify-content-center">
        {reports.map((report) => {
          const { id, reporter, video, reason, created_at } = report;

          return (
            <Col key={id} lg={10} xl={8} className="mb-4">
              <Card className="shadow-sm h-100">
                <Row className="g-0">
                  {/* Миниатюра видео */}
                  <Col md={4} lg={3}>
                    <NavLink to={`/videos/${video.id}`} className="d-block h-100">
                      <Card.Img
                        src={video.image || "/placeholder.jpg"}
                        alt={video.title}
                        className="h-100 w-100"
                        style={{ objectFit: "cover", borderRadius: "8px 0 0 8px" }}
                      />
                    </NavLink>
                  </Col>

                  {/* Основная информация и действия */}
                  <Col md={8} lg={9}>
                    <Card.Body className="d-flex flex-column h-100">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <Card.Title className="fs-4 mb-0">
                          <NavLink to={`/videos/${video.id}`} className="text-dark text-decoration-none">
                            {video.title}
                          </NavLink>
                        </Card.Title>
                      </div>

                      <div className="mb-3 text-muted">
                        <strong>Канал:</strong>{" "}
                        <NavLink
                          to={`/users/${video.channel.user.id}`}
                          className="text-decoration-none text-primary"
                        >
                          {video.channel.user.username || video.channel.user.email}
                        </NavLink>
                        {" | "}
                        <strong>Жалоба от:</strong>{" "}
                        <NavLink
                          to={`/users/${reporter.id}`}
                          className="text-decoration-none text-primary"
                        >
                          {reporter.username || reporter.email}
                        </NavLink>
                        {" | "}
                        {formatDate(created_at)}
                      </div>

                      <Card.Text className="flex-grow-1 mb-4">
                        <strong>Причина жалобы:</strong><br />
                        {reason}
                      </Card.Text>

                      <div className="mt-auto d-flex gap-3">
                        <Button
                          variant="danger"
                          onClick={() => handleResolve(id)}
                        >
                          Принять (удалить видео)
                        </Button>
                        <Button
                          variant="outline-secondary"
                          onClick={() => handleReject(id)}
                        >
                          Отклонить
                        </Button>
                      </div>
                    </Card.Body>
                  </Col>
                </Row>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
});

export default Reports;