from django.shortcuts import render

from rest_framework import viewsets
from .models import Account, Contact, Deal, Activity, DealPhase
from .serializers import AccountSerializer, ContactSerializer, DealSerializer, ActivitySerializer, DealPhaseSerializer

class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

class DealViewSet(viewsets.ModelViewSet):
    queryset = Deal.objects.all()
    serializer_class = DealSerializer

class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer

class DealPhaseViewSet(viewsets.ModelViewSet): # Kontrollera att detta namn används
    queryset = DealPhase.objects.all().order_by('order')
    serializer_class = DealPhaseSerializer