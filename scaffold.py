import os

os.chdir('s:\\KisanGat\\KisanGat')
os.makedirs('backend/config', exist_ok=True)
os.makedirs('backend/core', exist_ok=True)
os.makedirs('backend/utils', exist_ok=True)
os.makedirs('backend/media', exist_ok=True)
os.makedirs('backend/static', exist_ok=True)

apps = ['authentication', 'dashboard', 'farmers', 'collections', 'customers', 'sales', 'inventory', 'payments', 'products', 'employees', 'expenses', 'reports', 'settings']
for app in apps:
    os.makedirs(f'backend/apps/{app}', exist_ok=True)
    with open(f'backend/apps/{app}/__init__.py', 'w') as f: pass
    with open(f'backend/apps/{app}/apps.py', 'w') as f:
        f.write(f"from django.apps import AppConfig\n\nclass {app.capitalize()}Config(AppConfig):\n    default_auto_field = 'django.db.models.BigAutoField'\n    name = 'apps.{app}'\n")

# Frontend
dirs = ['api', 'app', 'assets', 'components', 'layouts', 'pages', 'routes', 'store', 'hooks', 'services', 'utils', 'themes']
for d in dirs:
    os.makedirs(f'frontend/src/{d}', exist_ok=True)
os.makedirs('frontend/public', exist_ok=True)

print("Folder structure generated!")
