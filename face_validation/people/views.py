import cv2
import numpy as np
import json
from django.http import JsonResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Person
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

        if not face_image:
            return Response({'message': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
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
                    return Response({
                        'name': person.name,
                        'roll_no': person.roll_no,
                    }, status=status.HTTP_200_OK)

            return Response({'message': 'No match found!'}, status=status.HTTP_404_NOT_FOUND)
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
