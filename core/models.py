from django.db import models

class DealPhase(models.Model):
    name = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=20, default="#3b82f6")
    is_default = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

    def save(self, *args, **kwargs):
        if self.is_default:
            DealPhase.objects.filter(is_default=True).update(is_default=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Account(models.Model):
    name = models.CharField(max_length=255)
    website = models.URLField(blank=True)
    industry = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.name

class Contact(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='contacts')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    role = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Deal(models.Model):
    # Vi lägger till null=True på ALLA nya fält
    documents = models.JSONField(default=list, blank=True)
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='deals', null=True, blank=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stage = models.ForeignKey(DealPhase, on_delete=models.PROTECT, null=True, blank=True)

    def __str__(self):
        return self.name if self.name else "Namnlös affär"

class Activity(models.Model):
    # Alternativ för rullistan
    ACTIVITY_CHOICES = [
        ('Call', 'Telefonsamtal'),
        ('Email', 'E-post'),
        ('Meeting', 'Möte'),
        ('Note', 'Anteckning'),
    ]

    # Kopplingar
    # On_delete=models.CASCADE gör att om företaget tas bort, försvinner även aktiviteterna
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='activities', null=True)
    contact = models.ForeignKey(Contact, on_delete=models.SET_NULL, related_name='activities', null=True, blank=True)
    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name='activities', null=True, blank=True)
    
    # Information
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_CHOICES, default='Note')
    note = models.TextField()
    date = models.DateTimeField(auto_now_add=True) # Sätter datum automatiskt när den skapas

    def __str__(self):
        return f"{self.activity_type} - {self.account.name if self.account else 'Inget företag'}"


class Product(models.Model):
    # Typer av produkter/tjänster
    PRODUCT_TYPES = [
        ('service', 'Tjänst'),
        ('hardware', 'Hårdvara'),
        ('software', 'Mjukvara'),
        ('subscription', 'Prenumeration'),
    ]

    name = models.CharField(max_length=255, verbose_name="Produktnamn")
    sku = models.CharField(max_length=50, unique=True, blank=True, null=True, verbose_name="Artikelnummer")
    description = models.TextField(blank=True, verbose_name="Beskrivning")
    
    # Prissättning
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.0, verbose_name="Listpris")
    cost_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.0, verbose_name="Inköpspris/Kostnad")
    
    # Kategorisering
    product_type = models.CharField(max_length=20, choices=PRODUCT_TYPES, default='service')
    is_active = models.BooleanField(default=True, verbose_name="Aktiv")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.sku})" if self.sku else self.name

    class Meta:
        verbose_name = "Produkt"
        verbose_name_plural = "Produkter"
        ordering = ['name']


class DealProduct(models.Model):
    deal = models.ForeignKey('Deal', on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    # Vi sparar priset här också ifall man ger rabatt på just denna affär
    sale_price = models.DecimalField(max_digits=12, decimal_places=2) 

    def total_amount(self):
        return self.quantity * self.sale_price
    