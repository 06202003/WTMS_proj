import os
import glob

def replace_colors(directory):
    files = glob.glob(os.path.join(directory, '**/*.tsx'), recursive=True)
    
    replacements = {
        '#1A4D2C': '#003A60', # Primary Dark
        '#11331c': '#002B4A', # Primary Darker (Hover)
        'emerald': 'blue',    # Primary Accent
        'green': 'sky'        # Secondary Accent
    }
    
    for file_path in files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = content
        for old, new in replacements.items():
            new_content = new_content.replace(old, new)
            
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated: {file_path}")

replace_colors('d:/Wimbledoc/wtms-pwa/src')
