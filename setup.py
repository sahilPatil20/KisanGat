import os
import subprocess

os.chdir('s:\\KisanGat\\KisanGat')
os.makedirs('backend', exist_ok=True)
os.chdir('backend')

print('Creating venv...')
subprocess.run(['python', '-m', 'venv', 'venv'])

print('Installing packages...')
subprocess.run(['venv\\Scripts\\python.exe', '-m', 'pip', 'install', 'Django', 'djangorestframework', 'djangorestframework-simplejwt', 'django-cors-headers', 'mysqlclient', 'python-dotenv'])

print('Starting django project...')
subprocess.run(['venv\\Scripts\\python.exe', '-m', 'django', 'startproject', 'config', '.'])

print('Creating folder structure...')
os.makedirs('apps', exist_ok=True)
os.makedirs('core', exist_ok=True)
os.makedirs('utils', exist_ok=True)
os.makedirs('media', exist_ok=True)
os.makedirs('static', exist_ok=True)

apps = ['authentication', 'dashboard', 'farmers', 'collections', 'customers', 'sales', 'inventory', 'payments', 'products', 'employees', 'expenses', 'reports', 'settings']
for app in apps:
    os.makedirs(f'apps/{app}', exist_ok=True)
    subprocess.run(['venv\\Scripts\\python.exe', 'manage.py', 'startapp', app, f'apps/{app}'])

print('Backend setup complete.')
