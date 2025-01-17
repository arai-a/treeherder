from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Load initial data into the master db"

    def handle(self, *args, **options):
        call_command(
            'loaddata',
            'repository_group',
            'repository',
            'failure_classification',
            'issue_tracker',
            'performance_framework',
            'performance_bug_templates',
            'performance_tag',
        )
