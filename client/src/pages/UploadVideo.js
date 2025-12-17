import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, ProgressBar, Spinner } from 'react-bootstrap';
import { upload_video } from '../http/videoAPI';

const VideoUploadPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_file: null,
  });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Разрешенные типы файлов
  const allowedVideoTypes = [
    'video/mp4',
    'video/quicktime',
    'video/avi',
    'video/x-matroska', // .mkv
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!allowedVideoTypes.includes(file.type)) {
      setError(`Неподдерживаемый формат видео. Разрешены: ${allowedVideoTypes.map(t => t.split('/')[1]).join(', ')}`);
      e.target.value = ''; // Сброс выбора файла
      return;
    }

    setError('');
    setFormData(prev => ({
      ...prev,
      video_file: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Пожалуйста, введите название видео');
      return;
    }

    if (!formData.video_file) {
      setError('Пожалуйста, выберите видео файл');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Создаем FormData для отправки файла
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('video_file', formData.video_file);

      // Используем axios с отслеживанием прогресса
      const { data } = await upload_video(formDataToSend);
      
      setSuccess('Видео успешно загружено!');
      setFormData({ title: '', description: '', video_file: null });
      setUploadProgress(0);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при загрузке видео');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0">Загрузка видео</h3>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                  {success}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="title">
                    Название видео <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Введите название видео"
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label htmlFor="description">Описание</Form.Label>
                  <Form.Control
                    as="textarea"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Введите описание видео (необязательно)"
                    rows={3}
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label htmlFor="video_file">
                    Видео файл <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="file"
                    id="video_file"
                    name="video_file"
                    accept=".mp4,.mov,.avi,.mkv,video/mp4,video/quicktime,video/x-msvideo,video/x-matroska"
                    onChange={handleFileChange}
                    required
                    disabled={loading}
                  />
                  <Form.Text className="text-muted">
                    Поддерживаемые форматы: MP4, MOV, AVI, MKV
                  </Form.Text>
                  {formData.video_file && (
                    <div className="mt-2">
                      <small className="text-muted">
                        Выбранный файл: {formData.video_file.name} 
                        ({(formData.video_file.size / (1024 * 1024)).toFixed(2)} MB)
                      </small>
                    </div>
                  )}
                </Form.Group>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mb-3">
                    <ProgressBar 
                      now={uploadProgress} 
                      label={`${uploadProgress}%`}
                      animated 
                    />
                    <small className="text-muted d-block mt-1">
                      Загрузка... Пожалуйста, не закрывайте страницу
                    </small>
                  </div>
                )}

                <div className="d-grid gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading || !formData.title || !formData.video_file}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Загрузка...
                      </>
                    ) : (
                      'Загрузить видео'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          <div className="mt-4">
            <Alert variant="info">
              <h5>Требования к видео:</h5>
              <ul className="mb-0">
                <li>Максимальный размер файла: 2GB</li>
                <li>Поддерживаемые форматы: MP4, MOV, AVI, MKV</li>
                <li>Рекомендуемое разрешение: 720p или выше</li>
                <li>Длительность видео: до 60 минут</li>
              </ul>
            </Alert>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default VideoUploadPage;
