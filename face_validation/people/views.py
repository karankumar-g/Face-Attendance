import cv2
from django.http import JsonResponse
import numpy as np
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from .models import Person
import face_recognition
from django.core.files.storage import default_storage
from rest_framework import status

import io
import json


@api_view(['POST'])
def add_person(request):
    if request.method == 'POST':
        name = request.data.get('name')
        age = request.data.get('age')
        class_name = request.data.get('class_name')
        department = request.data.get('department')
        roll_no = request.data.get('roll_no')
        face_image = request.FILES.get('face_image')

        if not all([name, age, class_name, department, roll_no, face_image]):
            return Response({'message': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        try:

            image_data = face_image.read()
            loaded_image = face_recognition.load_image_file(
                io.BytesIO(image_data))
            encodings = face_recognition.face_encodings(loaded_image)

            if len(encodings) != 1:
                return Response({'message': 'Image must contain exactly one face'}, status=status.HTTP_400_BAD_REQUEST)

            encoding = encodings[0].tolist()
            encoding_str = json.dumps(encoding)

            person = Person(
                name=name,
                age=age,
                class_name=class_name,
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
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

            face_locations = face_recognition.face_locations(rgb_image)
            face_encodings = face_recognition.face_encodings(
                rgb_image, face_locations)

            if not face_encodings:
                return Response({'message': 'No face found in the image!'}, status=status.HTTP_400_BAD_REQUEST)

            face_encoding = face_encodings[0]

            face_encoding_list = face_encoding.tolist()

            persons = Person.objects.all()
            for person in persons:
                stored_encoding = json.loads(person.face_encoding)
                stored_encoding_np = np.array(stored_encoding)

                matches = face_recognition.compare_faces(
                    [stored_encoding_np], face_encoding, tolerance=0.3)
                if matches[0]:
                    return Response({
                        'name': person.name,
                        'roll_no': person.roll_no,
                    }, status=status.HTTP_200_OK)

            return Response({'message': 'No match found!'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
