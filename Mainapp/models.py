from django.db import models

class UserType(models.Model):
    username=models.CharField(max_length=150, unique=True)
    user_type=models.CharField(max_length=50)
    

    def __str__(self):
        return self.username+" "+self.user_type
class AshaWorker(models.Model):
    id=models.AutoField(primary_key=True)
    name=models.CharField(max_length=30)
    assign_to=models.CharField(max_length=50)
