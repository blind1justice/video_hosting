import tempfile
import os
import re
import shutil
from typing import Optional, BinaryIO
from moviepy.editor import VideoFileClip
from PIL import Image


class VideoProcessorService:
    def _sanitize_extension(self, video_format: str) -> str:
        """
        Извлекает расширение файла из MIME типа или очищает формат.
        """
        # Если это MIME type вида "video/mp4", "video/x-matroska"
        if '/' in video_format:
            parts = video_format.split('/')
            if len(parts) == 2:
                ext = parts[1].lower()
                
                # Убираем 'x-' префикс если есть
                if ext.startswith('x-'):
                    ext = ext[2:]
                
                # Специфичные маппинги
                mime_map = {
                    'matroska': 'mkv',
                    'quicktime': 'mov',
                    'mpeg': 'mpg',
                    'msvideo': 'avi',
                    'flv': 'flv',
                    'ms-wmv': 'wmv',
                    'webm': 'webm',
                    'ogg': 'ogv',
                    'mp4': 'mp4',
                    'm4v': 'm4v',
                    '3gp': '3gp',
                    '3g2': '3g2'
                }
                
                if ext in mime_map:
                    return mime_map[ext]
                
                # Просто оставляем только буквы и цифры
                return re.sub(r'[^a-z0-9]', '', ext)
        
        # Если не MIME type, просто очищаем
        clean = re.sub(r'[^a-zA-Z0-9]', '', video_format)
        return clean[:10] if clean else 'mp4'

    async def _read_file_data(self, file_obj) -> bytes:
        """
        Читает данные из файлового объекта (SpooledTemporaryFile, BytesIO, etc.)
        """
        try:
            # Если это SpooledTemporaryFile или обычный файловый объект
            if hasattr(file_obj, 'read'):
                # Перемещаем курсор в начало если нужно
                if hasattr(file_obj, 'seek'):
                    file_obj.seek(0)
                return file_obj.read()
            # Если уже bytes
            elif isinstance(file_obj, bytes):
                return file_obj
            else:
                raise ValueError(f"Unsupported file type: {type(file_obj)}")
        except Exception as e:
            print(f"Error reading file data: {e}")
            raise

    async def extract_first_frame(
        self,
        video_file,  # Может быть bytes или файловый объект
        video_format: str,
    ) -> Optional[bytes]:
        # Читаем данные из файлового объекта
        video_data = await self._read_file_data(video_file)
        extension = self._sanitize_extension(video_format)
        
        # Создаем временную директорию
        temp_dir = tempfile.mkdtemp()
        video_filename = f"input_video.{extension}"
        temp_video_path = os.path.join(temp_dir, video_filename)
        
        try:
            # Пишем видео в файл
            with open(temp_video_path, 'wb') as f:
                f.write(video_data)
            
            # Извлекаем кадр
            with VideoFileClip(temp_video_path) as clip:
                frame = clip.get_frame(0)
            
            # Создаем миниатюру
            img = Image.fromarray(frame)
            
            # Сохраняем во временный файл
            thumb_path = os.path.join(temp_dir, "thumbnail.jpg")
            img.save(thumb_path, 'JPEG', quality=85)
            
            # Читаем байты миниатюры
            with open(thumb_path, 'rb') as f:
                return f.read()
                
        except Exception as e:
            print(f"Error extracting frame: {e}")
            return None
        finally:
            # Удаляем временную директорию
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir, ignore_errors=True)

    async def get_video_duration(self, video_file, video_format: str) -> int:
        # Читаем данные из файлового объекта
        video_data = await self._read_file_data(video_file)
        extension = self._sanitize_extension(video_format)
        
        temp_dir = tempfile.mkdtemp()
        video_filename = f"duration_video.{extension}"
        temp_video_path = os.path.join(temp_dir, video_filename)
        
        try:
            # Пишем видео в файл
            with open(temp_video_path, 'wb') as f:
                f.write(video_data)
            
            # Получаем продолжительность
            with VideoFileClip(temp_video_path) as clip:
                return int(clip.duration)
                
        except Exception as e:
            print(f"Error getting duration: {e}")
            return 0
        finally:
            # Удаляем временную директорию
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir, ignore_errors=True)
