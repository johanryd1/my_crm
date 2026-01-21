from rest_framework import serializers
from .models import Account, Contact, Deal, Activity, DealPhase

class ContactSerializer(serializers.ModelSerializer):

    account_name = serializers.ReadOnlyField(source='account.name')
    
    class Meta:
        model = Contact
        fields = ['id', 'account', 'first_name', 'last_name', 'email', 'phone', 'role', 'is_active', 'account_name']

class DealPhaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = DealPhase
        fields = '__all__'

class AccountSerializer(serializers.ModelSerializer):
    contacts = ContactSerializer(many=True, read_only=True)

    class Meta:
        model = Account
        fields = ['id', 'name', 'website', 'industry', 'contacts', 'address', 'phone', 'phase', 'phase_details']

class DealSerializer(serializers.ModelSerializer):
    # 'stage_details' används för att visa information (read_only)
    # Det gör att du får med färg och namn direkt i affär-objektet
    stage_details = DealPhaseSerializer(source='stage', read_only=True)
    
    # Vi kan även hämta kontots namn så det blir lättare att visa i listor
    account_name = serializers.ReadOnlyField(source='account.name')

    class Meta:
        model = Deal
        fields = [
            'id', 
            'name', 
            'value', 
            'stage',         # Används för att skriva (id)
            'stage_details', # Används för att läsa (objekt)
            'account',       # Används för att skriva (id)
            'account_name'   # Används för att läsa (text)
        ]

    # Valfritt: Om du vill att 'value' alltid ska returneras som ett nummer 
    # och inte en sträng (DecimalField kan ibland bli sträng i JSON)
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['value'] = float(instance.value)
        return representation

class DealSerializer(serializers.ModelSerializer):
    phase_details = DealPhaseSerializer(source='stage', read_only=True)

    class Meta:
        model = Deal
        fields = ['id', 'name', 'website', 'industry', 'contacts', 'address', 'phone', 'phase', 'phase_details']

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'account', 'contact', 'activity_type', 'note', 'date'] # Se till att 'account' är med!

        