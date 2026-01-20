from rest_framework import serializers
from .models import Account, Contact, Deal, Activity, AccountPhase

class ContactSerializer(serializers.ModelSerializer):

    account_name = serializers.ReadOnlyField(source='account.name')
    
    class Meta:
        model = Contact
        fields = ['id', 'account', 'first_name', 'last_name', 'email', 'phone', 'role', 'is_active', 'account_name']

class AccountPhaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountPhase
        fields = '__all__'

class AccountSerializer(serializers.ModelSerializer):
    contacts = ContactSerializer(many=True, read_only=True)
    phase_details = AccountPhaseSerializer(source='phase', read_only=True)

    class Meta:
        model = Account
        fields = ['id', 'name', 'website', 'industry', 'contacts', 'address', 'phone', 'phase', 'phase_details']

class DealSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deal
        fields = '__all__'

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'account', 'contact', 'activity_type', 'note', 'date'] # Se till att 'account' är med!

        