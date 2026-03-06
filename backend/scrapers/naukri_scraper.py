import pandas as pd
import numpy as np
from selenium import webdriver
import chromedriver_binary
chromedriver_binary.chromedriver_filename


import os
from supabase import create_client, Client
from dotenv import load_dotenv


from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import time
from bs4 import BeautifulSoup
import requests
from tqdm import tqdm

# Look for .env in the parent directory (backend/)
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Load credentials from your .env file
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") # Use Service Key for write access
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Setup
chrome_path = "C:/Users/HP/anaconda3/Lib/site-packages/chromedriver_binary/chromedriver.exe"

# Add executable permission (optional, but safe)
import os
os.chmod(chrome_path, 0o755)

# Configure service and options
service = Service(chrome_path)
options = Options()

# Keep the browser open after script ends
options.add_experimental_option("detach", True)

# Launch the browser
driver = webdriver.Chrome(service=service, options=options)
data =[]

for page in tqdm (range(1,10)):
    #link= 'https://www.naukri.com/trending-jobs?k=trending&experience=0&qproductJobSource=2&naukriCampus=true&experience=0&nignbevent_src=jobsearchDeskGNB' + str(page)

    if page == 1:
        link = 'https://www.naukri.com/trending-jobs?k=trending&experience=0'
    else:
        link = f'https://www.naukri.com/trending-jobs-{page}?k=trending&experience=0'
    
    driver.get(link)
    res=requests.get(link)
    time.sleep(2)
    soup=BeautifulSoup(driver.page_source,'html.parser')
    for job in soup.find_all('div',class_='srp-jobtuple-wrapper'):
        try:
            title=(job.find('a',class_='title').text)
        except:
            title=np.nan
        try:    
            job_link=job.find('a',class_='title').get('href')
        except:
            title=np.nan    
        try:
            stars=(job.find('span',class_='main-2').text)
        except:
            stars=np.nan
        try:
            company=(job.find('a' ,class_="comp-name mw-25")).text
        except:
            company=np.nan
        try:
            reviews=(job.find_all('a', class_='review ver-line')[-1].text.split()[0])

        except:
            reviews=np.nan
        try:
            experience= job.find('span',class_='ni-job-tuple-icon ni-job-tuple-icon-srp-experience exp').text
        except:
            experience=np.nan
        try:
            location=   job.find('span',class_='ni-job-tuple-icon ni-job-tuple-icon-srp-location loc').text
        except:
            location=   np.nan
        try:
            skills= ([skill.text for skill in job.find_all('li',class_='dot-gt tag-li')])
        except:
            skills= np.nan
        
        try:
            posted =    job.find('span',class_='job-post-day').text
        except:
            posted =    np.nan
    

        data.append([title,job_link,stars,company,reviews,experience,location,skills,posted])

print(data)

# Prepare data for Supabase
# We convert the list of lists into a list of dictionaries
db_insert_data = []

from datetime import datetime
import pandas as pd
current_time = datetime.now().isoformat()

# Helper function to clean NaN values
def clean_val(val):
    if pd.isna(val) or val is np.nan:
        return None
    return val

db_insert_data = []
for item in data:
    # ... your existing AI check logic ...
    skills_list = item[7] if isinstance(item[7], list) else []
    has_ai = any(term in [s.upper() for s in skills_list] for term in ['AI', 'ML', 'LLM', 'GPT', 'PYTHON'])

    db_insert_data.append({
        "title": clean_val(item[0]),
        "job_link": clean_val(item[1]),
        "stars": clean_val(item[2]),
        "company": clean_val(item[3]),
        "reviews": clean_val(item[4]),
        "experience": clean_val(item[5]),
        "location": clean_val(item[6]),
        "skills": item[7] if isinstance(item[7], list) else [], # Ensure this is a list [] not NaN
        "posted": str(item[8]) if not pd.isna(item[8]) else "Unknown",
        "has_ai_mention": has_ai,
        "scraped_at": current_time
    })

#for item in data:
    # Logic to check for AI mentions (Required for your Scoring Engine)
    # This checks if the word 'AI', 'Machine Learning', or 'LLM' is in the skills
    

    # In your Python scraper:
 #   db_insert_data.append({
  #      "title": item[0],
   #     "job_link": item[1],
    #    "stars": item[2] if not pd.isna(item[2]) else None,
     #   "company": item[3],
      #  "reviews": item[4],
     #   "experience": item[5],
    #    "location": item[6],
     #   "skills": item[7], # This should be ['Python', 'SQL'] etc.
     #   "posted": skills_list, # Ensure this is a string
      #  "has_ai_mention": has_ai,
       # "scraped_at": current_time
    #})

print(f"Total jobs scraped: {len(data)}")
print(f"Sample data for DB: {db_insert_data[:1]}") # See the first item

if not db_insert_data:
    print("❌ Error: No data found to upload. Check your BeautifulSoup selectors.")

# Upload to Supabase
if db_insert_data:
    try:
        # Table name must match what you created in Supabase (e.g., 'job_listings')
        response = supabase.table("job_listings").insert(db_insert_data).execute()
        print(f"Successfully uploaded {len(db_insert_data)} jobs to Supabase.")
    except Exception as e:
        print(f"Error uploading to Supabase: {e}")