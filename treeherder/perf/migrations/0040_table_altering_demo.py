# Generated by Django 3.1.6 on 2021-04-22 15:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('perf', '0039_store_more_job_details_on_record'),
    ]

    operations = [
        migrations.AddField(
            model_name='backfillrecord',
            name='demo_table_altering',
            field=models.CharField(max_length=500, null=True),
        ),
    ]
