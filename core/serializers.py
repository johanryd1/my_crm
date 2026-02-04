from rest_framework import serializers
from .models import Account, Contact, Deal, Activity, DealPhase, Product, DealProduct

class ContactSerializer(serializers.ModelSerializer):

    account_name = serializers.ReadOnlyField(source='account.name')
    
    class Meta:
        model = Contact
        fields = ['id', 'account', 'first_name', 'last_name', 'email', 'phone', 'role', 'is_active', 'account_name']

class DealPhaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = DealPhase
        fields = '__all__'

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'account', 'contact', 'activity_type', 'note', 'date', 'deal'] # Se till att 'account' är med!

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'


class DealProductSerializer(serializers.ModelSerializer):
    # Vi lägger till produktnamnet som "read_only" så att frontend 
    # lätt kan visa vad det är för produkt utan extra anrop
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = DealProduct
        fields = ['id', 'deal', 'product', 'product_name', 'quantity', 'sale_price']

class DealSerializer(serializers.ModelSerializer):
    # 'stage_details' används för att visa information (read_only)
    # Det gör att du får med färg och namn direkt i affär-objektet
    stage_details = DealPhaseSerializer(source='stage', read_only=True)

    # 'items' matchar 'related_name' som vi satte i models.py
    items = DealProductSerializer(many=True, read_only=True)
    
    # Vi kan även hämta kontots namn så det blir lättare att visa i listor
    account_name = serializers.ReadOnlyField(source='account.name')

    activities = ActivitySerializer(many=True, read_only=True)

    class Meta:
        model = Deal
        fields = ['id', 'name', 'value', 'stage', 'stage_details', 'account', 'items', 'account_name', 'activities', 'documents']

    # Valfritt: Om du vill att 'value' alltid ska returneras som ett nummer 
    # och inte en sträng (DecimalField kan ibland bli sträng i JSON)
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['value'] = float(instance.value)
        return representation


class AccountSerializer(serializers.ModelSerializer):
    contacts = ContactSerializer(many=True, read_only=True)
    deals = DealSerializer(many=True, read_only=True)

    class Meta:
        model = Account
        fields = ['id', 'name', 'website', 'industry', 'contacts', 'address', 'phone', 'deals', 'created_at']




