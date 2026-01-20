from django.db import models

class AccountPhase(models.Model):
    name = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=20, default="#3b82f6") # Hex-kod för Tailwind
    is_default = models.BooleanField(default=False)
    order = models.IntegerField(default=0) # För att kunna sortera faserna (t.ex. Prospect -> Kund)

    def save(self, *args, **kwargs):
        # Säkerställ att bara en fas kan vara "is_default"
        if self.is_default:
            AccountPhase.objects.filter(is_default=True).update(is_default=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Account(models.Model):
    phase = models.ForeignKey(
        'AccountPhase', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='accounts'
)
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
    STAGES = [
        ('PROSPECT', 'Prospect'),
        ('OFFER', 'Sent Offer'),
        ('CLOSED_WON', 'Closed Won'),
        ('CLOSED_LOST', 'Closed Lost'),
    ]
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    stage = models.CharField(max_length=20, choices=STAGES, default='PROSPECT')

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
    
    # Information
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_CHOICES, default='Note')
    note = models.TextField()
    date = models.DateTimeField(auto_now_add=True) # Sätter datum automatiskt när den skapas

    def __str__(self):
        return f"{self.activity_type} - {self.account.name if self.account else 'Inget företag'}"
