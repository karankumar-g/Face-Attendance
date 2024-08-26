import cv2
import numpy as np
import json
from django.http import JsonResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Person, Session, Attendance
import uuid
import face_recognition
import io


@api_view(['POST'])
def add_person(request):
    if request.method == 'POST':
        name = request.data.get('name')
        age = request.data.get('age')
        year = request.data.get('year')
        department = request.data.get('department')
        roll_no = request.data.get('roll_no')
        face_image = request.FILES.get('face_image')

        if not all([name, age, year, department, roll_no, face_image]):
            return Response({'message': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            image_data = face_image.read()
            loaded_image = face_recognition.load_image_file(
                io.BytesIO(image_data))
            encodings = face_recognition.face_encodings(loaded_image)

            if len(encodings) != 1:
                return Response({'message': 'Image must contain exactly one face'}, status=status.HTTP_400_BAD_REQUEST)

            encoding_list = encodings[0].tolist()
            encoding_str = json.dumps(encoding_list)

            person = Person(
                name=name,
                age=age,
                year=year,
                department=department,
                roll_no=roll_no,
                face_encoding=encoding_str
            )
            person.save()

            return Response({'message': 'Person added successfully'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def validate_person(request):
    if request.method == 'POST':
        face_image = request.FILES.get('face_image')
        session_id = request.data.get('session_id')

        if not face_image or not session_id:
            return Response({'message': 'Image and session ID are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            session = Session.objects.get(session_id=session_id)

            image_data = face_image.read()
            image = np.asarray(bytearray(image_data), dtype=np.uint8)
            image = cv2.imdecode(image, cv2.IMREAD_COLOR)

            face_locations, recognized_face_encoding, multiple_faces_detected = detect_and_recognize_face(
                image)

            if multiple_faces_detected:
                return Response({'message': 'Multiple faces detected in the image!'}, status=status.HTTP_400_BAD_REQUEST)

            if recognized_face_encoding is None:
                return Response({'message': 'No face recognized!'}, status=status.HTTP_404_NOT_FOUND)

            recognized_face_encoding_list = recognized_face_encoding.tolist()

            persons = Person.objects.all()
            for person in persons:
                stored_encoding_str = person.face_encoding
                stored_encoding_list = json.loads(stored_encoding_str)

                if compare_encodings(stored_encoding_list, recognized_face_encoding_list):
                    Attendance.objects.create(person=person, session=session)

                    return Response({
                        'message': f'Attendance marked for {person.name} in session {session.session_name}',
                        'name': person.name,
                        'roll_no': person.roll_no,
                    }, status=status.HTTP_200_OK)

            return Response({'message': 'No match found!'}, status=status.HTTP_404_NOT_FOUND)
        except Session.DoesNotExist:
            return Response({'message': 'Invalid session ID'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def detect_and_recognize_face(image, tolerance=0.5):
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    face_locations = face_recognition.face_locations(rgb_image)
    face_encodings = face_recognition.face_encodings(rgb_image, face_locations)

    recognized_face_encoding = None
    multiple_faces_detected = False

    if len(face_locations) > 1:
        multiple_faces_detected = True
    elif face_encodings:
        recognized_face_encoding = face_encodings[0]

    return face_locations, recognized_face_encoding, multiple_faces_detected


def compare_encodings(stored_encoding_list, recognized_face_encoding_list, tolerance=0.5):
    recognized_face_encoding_np = np.array(recognized_face_encoding_list)
    matches = face_recognition.compare_faces(
        [stored_encoding_list], recognized_face_encoding_np, tolerance=tolerance)
    return any(matches)


@api_view(['POST'])
def create_session(request):
    session_name = request.data.get('session_name')

    if not session_name:
        return Response({'message': 'Session name is required'}, status=status.HTTP_400_BAD_REQUEST)

    session_id = str(uuid.uuid4())
    session = Session.objects.create(
        session_name=session_name, session_id=session_id)

    return Response({'message': 'Session created successfully', 'session_id': session.session_id}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def list_sessions(request):
    sessions = Session.objects.all()
    session_data = [{'session_name': s.session_name,
                     'session_id': s.session_id, 'created_at': s.created_at} for s in sessions]

    return Response(session_data, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_attendance(request, session_id):
    try:
        session = Session.objects.get(session_id=session_id)
        attendance_records = Attendance.objects.filter(session=session)
        attendance_data = [
            {'person': record.person.name, 'timestamp': record.timestamp}
            for record in attendance_records
        ]

        return Response(attendance_data, status=status.HTTP_200_OK)
    except Session.DoesNotExist:
        return Response({'message': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
