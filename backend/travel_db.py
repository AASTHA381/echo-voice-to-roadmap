"""
Expanded Travel Database for CoTrip
Hotels (10+), Flights (8+), Trains (6+), Buses (6+) per destination.
"""
from typing import Dict, Any

MOCK_TRAVEL_DB: Dict[str, Any] = {
    "Goa": {
        "hotels": [
            {"id": "h-goa-1",  "name": "Taj Exotica Resort & Spa",         "rating": 4.9, "price": 18500, "description": "Mediterranean-style luxury resort overlooking the Arabian Sea with private beach."},
            {"id": "h-goa-2",  "name": "W Goa – Vagator Beach",            "rating": 4.8, "price": 22000, "description": "Trendy clifftop design hotel with SPICE restaurant, WET pool deck & stunning views."},
            {"id": "h-goa-3",  "name": "The Leela Goa",                    "rating": 4.8, "price": 20000, "description": "217-acre resort in Cavelossim with lagoon pools, golf course, and private beach."},
            {"id": "h-goa-4",  "name": "Park Hyatt Goa Resort & Spa",      "rating": 4.7, "price": 16500, "description": "Portuguese colonial architecture on 26-acre grounds with azure lagoon pools."},
            {"id": "h-goa-5",  "name": "Aloft Goa Calangute",              "rating": 4.2, "price": 6800,  "description": "Vibrant lifestyle hotel steps from Calangute beach with WXYZ bar."},
            {"id": "h-goa-6",  "name": "Fairfield by Marriott Benaulim",   "rating": 4.3, "price": 7200,  "description": "Modern comfort with spacious rooms, outdoor pool, and local cuisines."},
            {"id": "h-goa-7",  "name": "Lemon Tree Amarante Beach Resort", "rating": 4.1, "price": 5500,  "description": "Charming Portuguese architecture close to Candolim beach."},
            {"id": "h-goa-8",  "name": "Novotel Goa Candolim",             "rating": 4.0, "price": 5900,  "description": "Beachside Novotel with 3 pools, beach access, and all-day dining."},
            {"id": "h-goa-9",  "name": "Ginger Goa",                       "rating": 3.9, "price": 3200,  "description": "Smart budget hotel with clean rooms, cafe, and great connectivity."},
            {"id": "h-goa-10", "name": "OYO 2545 Hotel Sea Shell",         "rating": 3.7, "price": 1900,  "description": "Budget-friendly stay near Baga beach with clean rooms and Wi-Fi."},
        ],
        "flights": [
            {"id": "f-goa-1", "flight_no": "AI-864",  "airline": "Air India",     "departure": "10:30 AM", "arrival": "01:00 PM", "duration": "2h 30m", "price": 6200, "route": "DEL - GOI", "class": "Economy"},
            {"id": "f-goa-2", "flight_no": "6E-2134", "airline": "IndiGo",        "departure": "07:15 AM", "arrival": "09:45 AM", "duration": "2h 30m", "price": 5400, "route": "DEL - GOI", "class": "Economy"},
            {"id": "f-goa-3", "flight_no": "UK-843",  "airline": "Vistara",       "departure": "02:15 PM", "arrival": "04:45 PM", "duration": "2h 30m", "price": 7800, "route": "DEL - GOI", "class": "Economy"},
            {"id": "f-goa-4", "flight_no": "SG-169",  "airline": "SpiceJet",      "departure": "05:45 AM", "arrival": "08:15 AM", "duration": "2h 30m", "price": 4900, "route": "DEL - GOI", "class": "Economy"},
            {"id": "f-goa-5", "flight_no": "AI-866",  "airline": "Air India",     "departure": "04:00 PM", "arrival": "06:30 PM", "duration": "2h 30m", "price": 6800, "route": "DEL - GOI", "class": "Economy"},
            {"id": "f-goa-6", "flight_no": "UK-845",  "airline": "Vistara Biz",   "departure": "08:00 AM", "arrival": "10:30 AM", "duration": "2h 30m", "price": 9200, "route": "DEL - GOI", "class": "Business"},
            {"id": "f-goa-7", "flight_no": "6E-2190", "airline": "IndiGo",        "departure": "01:45 PM", "arrival": "04:15 PM", "duration": "2h 30m", "price": 5700, "route": "DEL - GOI", "class": "Economy"},
            {"id": "f-goa-8", "flight_no": "I5-781",  "airline": "Air Asia India","departure": "11:30 AM", "arrival": "02:10 PM", "duration": "2h 40m", "price": 4500, "route": "DEL - GOI", "class": "Economy"},
        ],
        "trains": [
            {"id": "t-goa-1", "train_no": "12432", "name": "Rajdhani Express",       "departure": "10:55 PM", "arrival": "11:05 AM", "duration": "36h 10m", "from": "NDLS", "to": "MAO", "price_sl": 780,  "price_3a": 2045, "price_2a": 2935, "price_1a": 5115, "days": "Mon,Tue,Thu,Fri,Sat"},
            {"id": "t-goa-2", "train_no": "12780", "name": "Goa Express",            "departure": "03:20 PM", "arrival": "07:45 AM", "duration": "40h 25m", "from": "HZM",  "to": "VSG", "price_sl": 595,  "price_3a": 1565, "price_2a": 2245, "price_1a": 3795, "days": "Daily"},
            {"id": "t-goa-3", "train_no": "10104", "name": "Mandovi Express",        "departure": "07:10 AM", "arrival": "06:55 AM", "duration": "47h 45m", "from": "CSTM", "to": "MAO", "price_sl": 630,  "price_3a": 1650, "price_2a": 2360, "price_1a": 4100, "days": "Wed,Sun"},
            {"id": "t-goa-4", "train_no": "22414", "name": "Rajdhani Express (MAS)", "departure": "09:45 PM", "arrival": "10:15 AM", "duration": "36h 30m", "from": "MAS",  "to": "MAO", "price_sl": None, "price_3a": 2180, "price_2a": 3110, "price_1a": 5445, "days": "Tue,Fri"},
            {"id": "t-goa-5", "train_no": "12133", "name": "Mangala Express",        "departure": "08:00 AM", "arrival": "05:10 AM", "duration": "45h 10m", "from": "LTT",  "to": "MAO", "price_sl": 555,  "price_3a": 1465, "price_2a": 2105, "price_1a": 3650, "days": "Daily"},
            {"id": "t-goa-6", "train_no": "11097", "name": "Poorna Express",         "departure": "11:35 PM", "arrival": "01:25 PM", "duration": "37h 50m", "from": "PUNE", "to": "VSG", "price_sl": 505,  "price_3a": 1335, "price_2a": 1920, "price_1a": 3335, "days": "Mon,Thu,Sat"},
        ],
        "buses": [
            {"id": "b-goa-1", "operator": "SRS Travels",       "type": "Volvo AC Multi-Axle",    "departure": "07:00 PM", "arrival": "08:30 AM", "duration": "13h 30m", "from": "Bangalore", "to": "Panaji", "price": 1150, "amenities": "AC, Charging, Blanket, Water"},
            {"id": "b-goa-2", "operator": "Paulo Travels",     "type": "Sleeper AC",              "departure": "09:30 PM", "arrival": "11:00 AM", "duration": "13h 30m", "from": "Pune",     "to": "Mapusa", "price": 950,  "amenities": "AC, Sleeper Berth, Charging"},
            {"id": "b-goa-3", "operator": "VRL Travels",       "type": "Volvo AC Semi-Sleeper",   "departure": "08:00 PM", "arrival": "09:30 AM", "duration": "13h 30m", "from": "Hubli",    "to": "Panaji", "price": 780,  "amenities": "AC, Recliner, USB"},
            {"id": "b-goa-4", "operator": "Kadamba Transport", "type": "Government Sleeper",      "departure": "06:30 PM", "arrival": "07:00 AM", "duration": "12h 30m", "from": "Bangalore","to": "Margao", "price": 550,  "amenities": "Non-AC, Sleeper"},
            {"id": "b-goa-5", "operator": "MSRTC Shivshahi",  "type": "Premium AC Semi-Sleeper", "departure": "10:00 PM", "arrival": "11:30 AM", "duration": "13h 30m", "from": "Mumbai",   "to": "Panaji", "price": 850,  "amenities": "AC, Recliner, Wi-Fi"},
            {"id": "b-goa-6", "operator": "Neeta Tours",       "type": "AC Seater",               "departure": "05:00 PM", "arrival": "06:30 AM", "duration": "13h 30m", "from": "Ahmedabad","to": "Panaji", "price": 1250, "amenities": "AC, Blanket, Charging, Meal"},
        ],
        "activities": [
            {"id": "a-goa-1", "name": "Scuba Diving at Grand Island",  "rating": 4.7, "price": 3500, "description": "Explore marine life with breakfast, lunch and certified training."},
            {"id": "a-goa-2", "name": "Sunset Dinner Cruise",          "rating": 4.4, "price": 2200, "description": "Romantic Mandovi river cruise with dinner, music, and DJ."},
            {"id": "a-goa-3", "name": "South Goa Heritage Tour",       "rating": 4.2, "price": 1500, "description": "Visit historic churches, spice plantations, and Miramar beach."},
            {"id": "a-goa-4", "name": "Paragliding at Arambol Beach",  "rating": 4.5, "price": 2800, "description": "Fly over Arambol coastline with a certified instructor."},
            {"id": "a-goa-5", "name": "Spice Plantation Day Tour",     "rating": 4.3, "price": 1200, "description": "Walk through a working plantation and enjoy an authentic Goan lunch."},
        ]
    },
    "Mumbai": {
        "hotels": [
            {"id": "h-mum-1",  "name": "The Taj Mahal Palace",          "rating": 5.0, "price": 32000, "description": "Iconic 1903 heritage hotel overlooking Gateway of India."},
            {"id": "h-mum-2",  "name": "The Oberoi Mumbai",             "rating": 4.9, "price": 28000, "description": "Contemporary luxury on Marine Drive with breathtaking sea views."},
            {"id": "h-mum-3",  "name": "ITC Grand Central",             "rating": 4.8, "price": 22000, "description": "Grand colonial-style hotel in Parel with luxury dining and spa."},
            {"id": "h-mum-4",  "name": "Trident Nariman Point",         "rating": 4.7, "price": 18000, "description": "Stunning Marine Drive views, business-friendly with spa."},
            {"id": "h-mum-5",  "name": "JW Marriott Mumbai Juhu",       "rating": 4.7, "price": 17500, "description": "Beachside hotel at Juhu with celebrity dining and rooftop bar."},
            {"id": "h-mum-6",  "name": "Novotel Mumbai Juhu Beach",     "rating": 4.3, "price": 9500,  "description": "Modern hotel steps from Juhu beach with pool."},
            {"id": "h-mum-7",  "name": "Ibis Mumbai Airport",           "rating": 4.2, "price": 5800,  "description": "Smart airport hotel for transits with great connectivity."},
            {"id": "h-mum-8",  "name": "Lemon Tree Hotel Andheri",      "rating": 4.0, "price": 4900,  "description": "Cheerful modern hotel in the heart of Andheri."},
            {"id": "h-mum-9",  "name": "Hotel Suba Galaxy Andheri",     "rating": 3.9, "price": 3500,  "description": "Budget business hotel in Andheri East near the airport."},
            {"id": "h-mum-10", "name": "OYO 1278 Hotel Viceroy Palace", "rating": 3.7, "price": 1800,  "description": "Affordable rooms in Dadar with 24-hr reception."},
        ],
        "flights": [
            {"id": "f-mum-1", "flight_no": "AI-677",  "airline": "Air India",     "departure": "06:00 AM", "arrival": "08:00 AM", "duration": "2h", "price": 4200, "route": "DEL - BOM", "class": "Economy"},
            {"id": "f-mum-2", "flight_no": "6E-211",  "airline": "IndiGo",        "departure": "07:30 AM", "arrival": "09:30 AM", "duration": "2h", "price": 3800, "route": "DEL - BOM", "class": "Economy"},
            {"id": "f-mum-3", "flight_no": "UK-955",  "airline": "Vistara",       "departure": "09:00 AM", "arrival": "11:05 AM", "duration": "2h 05m", "price": 5100, "route": "DEL - BOM", "class": "Economy"},
            {"id": "f-mum-4", "flight_no": "SG-128",  "airline": "SpiceJet",      "departure": "11:45 AM", "arrival": "01:50 PM", "duration": "2h 05m", "price": 3400, "route": "DEL - BOM", "class": "Economy"},
            {"id": "f-mum-5", "flight_no": "I5-623",  "airline": "Air Asia India","departure": "02:30 PM", "arrival": "04:35 PM", "duration": "2h 05m", "price": 3100, "route": "DEL - BOM", "class": "Economy"},
            {"id": "f-mum-6", "flight_no": "AI-679",  "airline": "Air India",     "departure": "06:00 PM", "arrival": "08:00 PM", "duration": "2h", "price": 4800, "route": "DEL - BOM", "class": "Economy"},
            {"id": "f-mum-7", "flight_no": "UK-957",  "airline": "Vistara Biz",   "departure": "08:00 AM", "arrival": "10:05 AM", "duration": "2h 05m", "price": 7900, "route": "DEL - BOM", "class": "Business"},
            {"id": "f-mum-8", "flight_no": "6E-215",  "airline": "IndiGo",        "departure": "09:30 PM", "arrival": "11:30 PM", "duration": "2h", "price": 3600, "route": "DEL - BOM", "class": "Economy"},
        ],
        "trains": [
            {"id": "t-mum-1", "train_no": "12952", "name": "Mumbai Rajdhani",       "departure": "04:55 PM", "arrival": "08:35 AM", "duration": "15h 40m", "from": "NDLS","to": "BCT", "price_sl": None,"price_3a": 1865,"price_2a": 2665,"price_1a": 4630,"days": "Daily"},
            {"id": "t-mum-2", "train_no": "12954", "name": "August Kranti Rajdhani","departure": "07:55 PM", "arrival": "11:55 AM", "duration": "16h 00m", "from": "NDLS","to": "BCT", "price_sl": None,"price_3a": 1885,"price_2a": 2695,"price_1a": 4685,"days": "Daily"},
            {"id": "t-mum-3", "train_no": "22210", "name": "Duronto Express",       "departure": "09:55 PM", "arrival": "01:20 PM", "duration": "15h 25m", "from": "NDLS","to": "BCT", "price_sl": None,"price_3a": 1755,"price_2a": 2515,"price_1a": 4365,"days": "Mon,Wed,Fri,Sun"},
            {"id": "t-mum-4", "train_no": "12904", "name": "Golden Temple Mail",    "departure": "08:25 PM", "arrival": "12:55 PM", "duration": "16h 30m", "from": "NDLS","to": "BCT", "price_sl": 625, "price_3a": 1640,"price_2a": 2355,"price_1a": 4085,"days": "Daily"},
            {"id": "t-mum-5", "train_no": "12138", "name": "Punjab Mail",           "departure": "05:35 PM", "arrival": "10:35 AM", "duration": "17h 00m", "from": "NDLS","to": "CST", "price_sl": 590, "price_3a": 1555,"price_2a": 2235,"price_1a": 3875,"days": "Daily"},
            {"id": "t-mum-6", "train_no": "12162", "name": "Lashkar Express",       "departure": "10:40 PM", "arrival": "06:05 PM", "duration": "19h 25m", "from": "GWL", "to": "LTT", "price_sl": 510, "price_3a": 1345,"price_2a": 1935,"price_1a": 3355,"days": "Daily"},
        ],
        "buses": [
            {"id": "b-mum-1", "operator": "Orange Travels",    "type": "Volvo 9600 AC Sleeper",  "departure": "08:00 PM","arrival": "07:30 AM","duration": "11h 30m","from": "Pune",      "to": "Mumbai","price": 750, "amenities": "AC, Sleeper, Charging, Water"},
            {"id": "b-mum-2", "operator": "SRS Travels",       "type": "Volvo AC Multi-Axle",    "departure": "09:00 PM","arrival": "07:00 AM","duration": "10h 00m","from": "Bangalore", "to": "Mumbai","price": 1100,"amenities": "AC, Recliner, Charging, Blanket"},
            {"id": "b-mum-3", "operator": "MSRTC Shivshahi",  "type": "Premium AC Semi-Sleeper", "departure": "10:00 PM","arrival": "07:00 AM","duration": "09h 00m","from": "Nasik",     "to": "Mumbai","price": 480, "amenities": "AC, Recliner, USB"},
            {"id": "b-mum-4", "operator": "VRL Travels",       "type": "AC Seater",              "departure": "07:30 PM","arrival": "07:00 AM","duration": "11h 30m","from": "Goa",       "to": "Mumbai","price": 950, "amenities": "AC, Charging, Water"},
            {"id": "b-mum-5", "operator": "Neeta Tours",       "type": "Volvo AC Sleeper",       "departure": "05:00 PM","arrival": "04:30 AM","duration": "11h 30m","from": "Surat",     "to": "Mumbai","price": 600, "amenities": "AC, Sleeper, Meal"},
            {"id": "b-mum-6", "operator": "IntrCity SmartBus", "type": "AC Sleeper Luxury",      "departure": "11:00 PM","arrival": "08:00 AM","duration": "09h 00m","from": "Ahmedabad", "to": "Mumbai","price": 850, "amenities": "AC, 180 Sleeper, Wi-Fi, Meal"},
        ],
        "activities": [
            {"id": "a-mum-1", "name": "Elephanta Caves Tour",        "rating": 4.6, "price": 1800, "description": "Boat ride to Elephanta Island with guided cave temple tour."},
            {"id": "a-mum-2", "name": "Dharavi Slum Walking Tour",   "rating": 4.5, "price": 1200, "description": "Eye-opening guided tour of Asia's largest urban settlement."},
            {"id": "a-mum-3", "name": "Mumbai Street Food Walk",     "rating": 4.8, "price": 1500, "description": "Pav bhaji, vada pav, chaat - taste Mumbai's iconic street eats."},
            {"id": "a-mum-4", "name": "Bollywood Studio Tour",       "rating": 4.3, "price": 2200, "description": "Go behind the scenes at Film City, the home of Indian cinema."},
        ]
    },
    "Manali": {
        "hotels": [
            {"id": "h-man-1",  "name": "The Himalayan",               "rating": 4.9, "price": 14000, "description": "Luxury mountain resort with panoramic Himalayan views and award-winning spa."},
            {"id": "h-man-2",  "name": "Span Resort & Spa",           "rating": 4.7, "price": 11000, "description": "Riverside luxury resort on the Beas with private sit-outs."},
            {"id": "h-man-3",  "name": "Solang Valley Resort",        "rating": 4.5, "price": 8500,  "description": "Adventure resort at Solang Valley, perfect for ski season stays."},
            {"id": "h-man-4",  "name": "Johnson Hotel & Cafe",        "rating": 4.4, "price": 6500,  "description": "Heritage property run by the Johnson family since 1942."},
            {"id": "h-man-5",  "name": "Snow Valley Resorts Manali",  "rating": 4.3, "price": 5800,  "description": "Alpine-themed cottages with mountain views and cozy fireplaces."},
            {"id": "h-man-6",  "name": "Hotel Rohtang Retreat",       "rating": 4.1, "price": 4200,  "description": "Mid-range hotel with great Rohtang access and cozy rooms."},
            {"id": "h-man-7",  "name": "Hotel Harmony Manali",        "rating": 3.9, "price": 2800,  "description": "Budget option near Mall Road with clean rooms and rooftop cafe."},
            {"id": "h-man-8",  "name": "Zostel Manali",               "rating": 4.2, "price": 900,   "description": "Social hostel for backpackers with stunning mountain views."},
            {"id": "h-man-9",  "name": "Backpacker Panda Manali",     "rating": 4.0, "price": 750,   "description": "Budget hostel near Old Manali with community kitchen."},
            {"id": "h-man-10", "name": "OYO 22345 Hotel Snowland",    "rating": 3.6, "price": 1600,  "description": "Affordable hotel in central Manali with mountain views."},
        ],
        "flights": [
            {"id": "f-man-1", "flight_no": "AI-451", "airline": "Air India",         "departure": "06:00 AM", "arrival": "07:10 AM", "duration": "1h 10m", "price": 4200, "route": "DEL - KUU", "class": "Economy"},
            {"id": "f-man-2", "flight_no": "AI-453", "airline": "Air India",         "departure": "01:00 PM", "arrival": "02:10 PM", "duration": "1h 10m", "price": 4800, "route": "DEL - KUU", "class": "Economy"},
            {"id": "f-man-3", "flight_no": "9H-501", "airline": "Himalaya Airlines", "departure": "08:30 AM", "arrival": "09:45 AM", "duration": "1h 15m", "price": 3900, "route": "DEL - KUU", "class": "Economy"},
            {"id": "f-man-4", "flight_no": "9H-503", "airline": "Himalaya Airlines", "departure": "11:00 AM", "arrival": "12:15 PM", "duration": "1h 15m", "price": 4200, "route": "DEL - KUU", "class": "Economy"},
        ],
        "trains": [
            {"id": "t-man-1", "train_no": "12445", "name": "Shatabdi + HRTC Bus",   "departure": "07:20 AM", "arrival": "05:30 PM", "duration": "10h+", "from": "NDLS","to": "Manali","price_sl": None,"price_3a": 1100,"price_2a": None,"price_1a": None,"days": "Daily","note": "Train to Chandigarh then HRTC bus"},
            {"id": "t-man-2", "train_no": "12011", "name": "Kalka Shatabdi + Bus",   "departure": "06:00 AM", "arrival": "05:00 PM", "duration": "11h+", "from": "NDLS","to": "Manali","price_sl": None,"price_3a": 950, "price_2a": None,"price_1a": None,"days": "Daily","note": "Train to Ambala then HRTC bus"},
            {"id": "t-man-3", "train_no": "12029", "name": "Swarna Shatabdi + Bus",  "departure": "07:40 AM", "arrival": "06:30 PM", "duration": "11h+", "from": "NDLS","to": "Manali","price_sl": None,"price_3a": 1050,"price_2a": None,"price_1a": None,"days": "Daily","note": "Train to Chandigarh then HRTC bus"},
        ],
        "buses": [
            {"id": "b-man-1", "operator": "HRTC HP Tourism",  "type": "Deluxe AC Semi-Sleeper","departure": "05:00 PM","arrival": "07:00 AM","duration": "14h","from": "Delhi","to": "Manali","price": 950, "amenities": "AC, Recliner, Charging, Blanket"},
            {"id": "b-man-2", "operator": "Volvo HRTC",       "type": "Volvo AC Semi-Sleeper", "departure": "07:00 PM","arrival": "09:00 AM","duration": "14h","from": "Delhi","to": "Manali","price": 1100,"amenities": "AC, Recliner, Blanket, Water"},
            {"id": "b-man-3", "operator": "Himachal Tourism", "type": "Semi-Deluxe Non-AC",    "departure": "09:30 PM","arrival": "11:30 AM","duration": "14h","from": "Delhi","to": "Manali","price": 650, "amenities": "Fan, Recliner, Charging"},
            {"id": "b-man-4", "operator": "Swagat Travels",   "type": "Volvo AC Sleeper",      "departure": "08:00 PM","arrival": "10:00 AM","duration": "14h","from": "Delhi","to": "Manali","price": 1250,"amenities": "AC, Sleeper, Charging, Meal"},
            {"id": "b-man-5", "operator": "RedBus Premium",   "type": "AC Multi-Axle Sleeper", "departure": "06:00 PM","arrival": "08:00 AM","duration": "14h","from": "Delhi","to": "Manali","price": 1050,"amenities": "AC, Sleeper, Wi-Fi, Water"},
            {"id": "b-man-6", "operator": "IntrCity SmartBus","type": "Luxury Sleeper AC",     "departure": "10:00 PM","arrival": "12:00 PM","duration": "14h","from": "Delhi","to": "Manali","price": 1350,"amenities": "AC, 180 Sleeper, Meal, Wi-Fi"},
        ],
        "activities": [
            {"id": "a-man-1", "name": "Rohtang Pass Snow Day Trip",     "rating": 4.8, "price": 2500, "description": "See snow-capped peaks and play in fresh snow at 13,050 ft."},
            {"id": "a-man-2", "name": "Solang Valley Skiing & Zorbing", "rating": 4.7, "price": 3200, "description": "Try skiing, zorbing, and snow tubing with expert instructors."},
            {"id": "a-man-3", "name": "Beas River Rafting",             "rating": 4.6, "price": 1800, "description": "Grade II-III white water rafting on the Beas river."},
            {"id": "a-man-4", "name": "Paragliding at Dobhi",           "rating": 4.5, "price": 2000, "description": "Fly over the Kullu valley with breathtaking mountain views."},
        ]
    },
    "Paris": {
        "hotels": [
            {"id": "h-par-1", "name": "Hotel Ritz Paris",               "rating": 5.0, "price": 55000, "description": "Legendary palace hotel on Place Vendome with Michelin-starred dining."},
            {"id": "h-par-2", "name": "Four Seasons Hotel George V",    "rating": 5.0, "price": 62000, "description": "Art Deco palace with floral masterpieces steps from Champs-Elysees."},
            {"id": "h-par-3", "name": "Pullman Paris Tour Eiffel",      "rating": 4.6, "price": 24000, "description": "Excellent rooms with direct Eiffel Tower views and fitness center."},
            {"id": "h-par-4", "name": "Hotel Mercure Paris Eiffel",     "rating": 4.2, "price": 16000, "description": "Comfortable lodging just a 2-minute walk from the Eiffel Tower."},
            {"id": "h-par-5", "name": "Citadines Saint-Germain",        "rating": 4.3, "price": 14000, "description": "Stylish apart-hotel in bohemian Saint-Germain neighbourhood."},
            {"id": "h-par-6", "name": "ibis Paris Bastille Opera",      "rating": 4.0, "price": 8500,  "description": "Smart budget hotel near Bastille and Marais district."},
            {"id": "h-par-7", "name": "Generator Paris Hostel",         "rating": 4.1, "price": 3500,  "description": "Award-winning social hostel near Canal Saint-Martin."},
        ],
        "flights": [
            {"id": "f-par-1", "flight_no": "AF-225",  "airline": "Air France",  "departure": "01:10 PM","arrival": "06:45 PM","duration": "9h 35m", "price": 65000, "route": "DEL - CDG",          "class": "Economy"},
            {"id": "f-par-2", "flight_no": "EK-073",  "airline": "Emirates",    "departure": "10:05 AM","arrival": "08:30 PM","duration": "14h 25m","price": 72000, "route": "DEL - CDG (1 Stop)","class": "Economy"},
            {"id": "f-par-3", "flight_no": "QR-571",  "airline": "Qatar Airways","departure": "03:45 AM","arrival": "11:45 AM","duration": "12h 00m","price": 68000, "route": "DEL - CDG (1 Stop)","class": "Economy"},
            {"id": "f-par-4", "flight_no": "LH-762",  "airline": "Lufthansa",   "departure": "09:55 AM","arrival": "05:30 PM","duration": "11h 35m","price": 71000, "route": "DEL - CDG (1 Stop)","class": "Economy"},
            {"id": "f-par-5", "flight_no": "AF-227",  "airline": "Air France",  "departure": "09:30 PM","arrival": "06:00 AM","duration": "9h 30m", "price": 58000, "route": "DEL - CDG",          "class": "Economy"},
            {"id": "f-par-6", "flight_no": "EK-075B", "airline": "Emirates Biz","departure": "10:05 AM","arrival": "08:30 PM","duration": "14h 25m","price": 195000,"route": "DEL - CDG (1 Stop)","class": "Business"},
        ],
        "trains": [
            {"id": "t-par-1","train_no": "Eurostar","name": "Eurostar London-Paris","departure": "08:31 AM","arrival": "11:47 AM","duration": "3h 16m","from": "London St. Pancras","to": "Paris Gare du Nord","price_sl": None,"price_3a": 9500, "price_2a": 14000,"price_1a": 28000,"days": "Daily"},
            {"id": "t-par-2","train_no": "TGV",    "name": "TGV Brussels-Paris",  "departure": "07:25 AM","arrival": "08:55 AM","duration": "1h 30m","from": "Brussels-Midi",    "to": "Paris Gare du Nord","price_sl": None,"price_3a": 4500, "price_2a": 7000, "price_1a": 15000,"days": "Daily"},
            {"id": "t-par-3","train_no": "ICE",    "name": "ICE Frankfurt-Paris",  "departure": "10:03 AM","arrival": "02:15 PM","duration": "4h 12m","from": "Frankfurt Hbf",    "to": "Paris Est",         "price_sl": None,"price_3a": 6500, "price_2a": 10000,"price_1a": 22000,"days": "Daily"},
        ],
        "buses": [
            {"id": "b-par-1","operator": "FlixBus","type": "Eco AC Coach",   "departure": "08:00 AM","arrival": "02:30 PM","duration": "6h 30m","from": "Brussels",  "to": "Paris","price": 1200,"amenities": "AC, Wi-Fi, Charging, Toilet"},
            {"id": "b-par-2","operator": "Ouibus", "type": "AC Coach",       "departure": "07:00 AM","arrival": "01:00 PM","duration": "6h 00m","from": "Amsterdam", "to": "Paris","price": 1500,"amenities": "AC, Wi-Fi, Charging"},
            {"id": "b-par-3","operator": "FlixBus","type": "Night Coach AC", "departure": "10:30 PM","arrival": "05:00 AM","duration": "6h 30m","from": "London",    "to": "Paris","price": 1800,"amenities": "AC, Wi-Fi, Charging, Toilet"},
        ],
        "activities": [
            {"id": "a-par-1", "name": "Eiffel Tower Summit Access",        "rating": 4.8, "price": 4500, "description": "Skip the lines and head to the top floor with a local guide."},
            {"id": "a-par-2", "name": "Seine River Cruise 3-Course Dinner","rating": 4.6, "price": 6800, "description": "Panoramic cruise showing historical landmarks illuminated at night."},
            {"id": "a-par-3", "name": "Louvre Museum Guided Tour",         "rating": 4.5, "price": 3200, "description": "See the Mona Lisa and highlights with direct-entry access."},
        ]
    },
    "Tokyo": {
        "hotels": [
            {"id": "h-tok-1", "name": "Park Hyatt Tokyo",       "rating": 4.9, "price": 58000, "description": "Luxury hotel in Shinjuku tower with iconic Lost in Translation bar."},
            {"id": "h-tok-2", "name": "Aman Tokyo",             "rating": 5.0, "price": 95000, "description": "Serene urban sanctuary at Otemachi blending Japanese design and luxury."},
            {"id": "h-tok-3", "name": "Keio Plaza Hotel Tokyo", "rating": 4.5, "price": 28000, "description": "Spacious rooms in bustling Shinjuku, next to transit hubs."},
            {"id": "h-tok-4", "name": "Shinjuku Granbell Hotel","rating": 4.1, "price": 15000, "description": "Trendy boutique hotel in Kabukicho, featuring modern art."},
            {"id": "h-tok-5", "name": "Dormy Inn Akihabara",    "rating": 4.3, "price": 9500,  "description": "Popular chain hotel with natural hot spring bath in Akihabara."},
            {"id": "h-tok-6", "name": "Khaosan World Asakusa",  "rating": 4.0, "price": 3500,  "description": "Well-located hostel near Senso-ji temple."},
        ],
        "flights": [
            {"id": "f-tok-1", "flight_no": "JL-030",  "airline": "Japan Airlines",    "departure": "07:30 PM","arrival": "06:10 AM","duration": "8h 40m", "price": 58000, "route": "DEL - HND",          "class": "Economy"},
            {"id": "f-tok-2", "flight_no": "NH-830",  "airline": "ANA",               "departure": "08:15 PM","arrival": "07:05 AM","duration": "8h 50m", "price": 62000, "route": "DEL - HND",          "class": "Economy"},
            {"id": "f-tok-3", "flight_no": "EK-319",  "airline": "Emirates",          "departure": "03:30 AM","arrival": "09:50 PM","duration": "14h 20m","price": 55000, "route": "DEL - NRT (1 Stop)","class": "Economy"},
            {"id": "f-tok-4", "flight_no": "SQ-637",  "airline": "Singapore Airlines","departure": "08:10 AM","arrival": "09:30 PM","duration": "9h 20m", "price": 61000, "route": "DEL - NRT (1 Stop)","class": "Economy"},
            {"id": "f-tok-5", "flight_no": "JL-030B", "airline": "Japan Airlines Biz","departure": "07:30 PM","arrival": "06:10 AM","duration": "8h 40m", "price": 155000,"route": "DEL - HND",          "class": "Business"},
        ],
        "trains": [
            {"id": "t-tok-1","train_no": "Nozomi","name": "Shinkansen Nozomi Osaka-Tokyo","departure": "06:00 AM","arrival": "08:30 AM","duration": "2h 30m","from": "Shin-Osaka","to": "Tokyo","price_sl": None,"price_3a": 7500,"price_2a": None,"price_1a": 14000,"days": "Daily"},
            {"id": "t-tok-2","train_no": "NEX",  "name": "Narita Express Airport-City",  "departure": "On Demand","arrival": "60 min", "duration": "60m",  "from": "Narita Airport","to": "Shinjuku","price_sl": None,"price_3a": 3000,"price_2a": None,"price_1a": None, "days": "Daily"},
        ],
        "buses": [
            {"id": "b-tok-1","operator": "Willer Express","type": "Night Bus AC Sleeper","departure": "10:00 PM","arrival": "07:00 AM","duration": "9h","from": "Osaka","to": "Tokyo","price": 2200,"amenities": "AC, Recliner, Blanket, Wi-Fi"},
            {"id": "b-tok-2","operator": "JR Bus Kanto",  "type": "Highway Bus AC",    "departure": "08:00 AM","arrival": "12:00 PM","duration": "4h","from": "Kyoto","to": "Tokyo","price": 3500,"amenities": "AC, Charging, Wi-Fi, Toilet"},
        ],
        "activities": [
            {"id": "a-tok-1", "name": "Mt. Fuji & Hakone Day Trip",     "rating": 4.7, "price": 9500, "description": "Mt. Fuji 5th Station and cruise on Lake Ashi."},
            {"id": "a-tok-2", "name": "Shibuya Go-Kart Driving Tour",   "rating": 4.8, "price": 7500, "description": "Drive go-karts through Shibuya Crossing in costumes."},
            {"id": "a-tok-3", "name": "Tsukiji Outer Market Food Tour", "rating": 4.6, "price": 4800, "description": "Sample fresh sushi, wagyu beef, and local street treats."},
        ]
    },
    "Bali": {
        "hotels": [
            {"id": "h-bal-1", "name": "Ayana Resort Bali",             "rating": 4.9, "price": 24000, "description": "World-class clifftop resort in Jimbaran with famous Rock Bar."},
            {"id": "h-bal-2", "name": "Four Seasons Resort at Sayan",  "rating": 5.0, "price": 55000, "description": "Iconic resort nestled in Ubud's rice terraces."},
            {"id": "h-bal-3", "name": "Maya Ubud Resort & Spa",        "rating": 4.7, "price": 14500, "description": "Luxury rainforest villas along the Petanu River valley."},
            {"id": "h-bal-4", "name": "Courtyard by Marriott Seminyak","rating": 4.3, "price": 8500,  "description": "Vibrant beachside stay near shopping and local clubs."},
            {"id": "h-bal-5", "name": "Kuta Paradiso Hotel",           "rating": 4.2, "price": 5800,  "description": "Centrally-located hotel in Kuta near beach and malls."},
            {"id": "h-bal-6", "name": "Puri Dalem Cottages",           "rating": 4.0, "price": 3200,  "description": "Budget cottages in Ubud surrounded by rice fields."},
            {"id": "h-bal-7", "name": "Tribal Hostel Bali",            "rating": 4.1, "price": 1200,  "description": "Social hostel in Canggu, popular with surfers."},
        ],
        "flights": [
            {"id": "f-bal-1", "flight_no": "SQ-942",  "airline": "Singapore Airlines","departure": "09:55 AM","arrival": "06:40 PM","duration": "9h 45m", "price": 38000, "route": "DEL - DPS (1 Stop)","class": "Economy"},
            {"id": "f-bal-2", "flight_no": "VJ-897",  "airline": "VietJet Air",       "departure": "11:50 PM","arrival": "08:50 AM","duration": "11h 00m","price": 22000, "route": "DEL - DPS (1 Stop)","class": "Economy"},
            {"id": "f-bal-3", "flight_no": "EK-361",  "airline": "Emirates",          "departure": "03:30 AM","arrival": "08:00 PM","duration": "16h 30m","price": 42000, "route": "DEL - DPS (1 Stop)","class": "Economy"},
            {"id": "f-bal-4", "flight_no": "GA-202",  "airline": "Garuda Indonesia",  "departure": "06:30 AM","arrival": "06:30 PM","duration": "12h 00m","price": 35000, "route": "DEL - DPS (1 Stop)","class": "Economy"},
            {"id": "f-bal-5", "flight_no": "SQ-942B", "airline": "Singapore Biz",     "departure": "09:55 AM","arrival": "06:40 PM","duration": "9h 45m", "price": 110000,"route": "DEL - DPS (1 Stop)","class": "Business"},
        ],
        "trains": [],
        "buses": [
            {"id": "b-bal-1","operator": "Perama Tour",   "type": "AC Tourist Coach",   "departure": "08:00 AM","arrival": "12:00 PM","duration": "4h","from": "Kuta",     "to": "Ubud","price": 800,"amenities": "AC, Scenic Route"},
            {"id": "b-bal-2","operator": "Kura Kura Bus", "type": "AC Tourist Shuttle", "departure": "09:00 AM","arrival": "11:30 AM","duration": "2h 30m","from": "Seminyak","to": "Ubud","price": 650,"amenities": "AC, Wi-Fi, Charging"},
            {"id": "b-bal-3","operator": "Damri Bus",     "type": "Airport Shuttle",    "departure": "On Demand","arrival": "45 min","duration": "45m","from": "DPS Airport","to": "Kuta","price": 350,"amenities": "AC, Luggage Space"},
        ],
        "activities": [
            {"id": "a-bal-1", "name": "Ayung River White Water Rafting","rating": 4.5, "price": 2500, "description": "Adventurous rafting down Bali's longest river with lunch."},
            {"id": "a-bal-2", "name": "Mount Batur Sunrise Trekking",   "rating": 4.6, "price": 3000, "description": "Hike an active volcano for stunning sunrise views."},
            {"id": "a-bal-3", "name": "Ubud Sacred Monkey Forest Tour", "rating": 4.3, "price": 1800, "description": "Encounter monkeys and explore historical temples."},
            {"id": "a-bal-4", "name": "Balinese Cooking Class",         "rating": 4.7, "price": 2200, "description": "Learn to cook 5 traditional dishes with a local family."},
        ]
    }
}

GENERAL_MOCK_DATA: Dict[str, Any] = {
    "hotels": [
        {"id": "h-gen-1", "name": "Grand Palace Hotel",       "rating": 4.7, "price": 12000, "description": "Classic premium accommodations with modern amenities."},
        {"id": "h-gen-2", "name": "Central Plaza Lodge",      "rating": 4.2, "price": 6000,  "description": "Located directly downtown, great value for business or leisure."},
        {"id": "h-gen-3", "name": "Standard Inn & Suites",    "rating": 4.0, "price": 4500,  "description": "Budget-friendly stay with complimentary breakfast and parking."},
        {"id": "h-gen-4", "name": "Royal Comfort Hotel",      "rating": 4.3, "price": 7800,  "description": "Modern hotel with outdoor pool, gym, and all-day dining."},
        {"id": "h-gen-5", "name": "City View Premium Suites", "rating": 4.5, "price": 9500,  "description": "Spacious suites with panoramic city views and kitchenette."},
        {"id": "h-gen-6", "name": "Heritage Haveli Stay",     "rating": 4.1, "price": 3800,  "description": "Heritage-style property with local art and cultural evenings."},
        {"id": "h-gen-7", "name": "Budget Comfort Rooms",     "rating": 3.8, "price": 1800,  "description": "Clean budget rooms ideal for backpackers, free Wi-Fi."},
    ],
    "flights": [
        {"id": "f-gen-1", "flight_no": "AI-101", "airline": "Air India",   "departure": "09:00 AM","arrival": "12:00 PM","duration": "3h","price": 8500, "route": "DEL - DEST","class": "Economy"},
        {"id": "f-gen-2", "flight_no": "6E-501", "airline": "IndiGo",      "departure": "03:00 PM","arrival": "06:00 PM","duration": "3h","price": 6800, "route": "DEL - DEST","class": "Economy"},
        {"id": "f-gen-3", "flight_no": "UK-201", "airline": "Vistara",     "departure": "07:00 AM","arrival": "10:00 AM","duration": "3h","price": 9200, "route": "DEL - DEST","class": "Economy"},
        {"id": "f-gen-4", "flight_no": "SG-301", "airline": "SpiceJet",    "departure": "01:00 PM","arrival": "04:00 PM","duration": "3h","price": 5900, "route": "DEL - DEST","class": "Economy"},
        {"id": "f-gen-5", "flight_no": "UK-203", "airline": "Vistara Biz", "departure": "09:00 AM","arrival": "12:00 PM","duration": "3h","price": 18000,"route": "DEL - DEST","class": "Business"},
    ],
    "trains": [
        {"id": "t-gen-1","train_no": "12001","name": "Rajdhani Express", "departure": "05:00 PM","arrival": "08:00 AM","duration": "15h","from": "NDLS","to": "DEST","price_sl": 850, "price_3a": 2200,"price_2a": 3200,"price_1a": 5500,"days": "Daily"},
        {"id": "t-gen-2","train_no": "12051","name": "Shatabdi Express", "departure": "06:00 AM","arrival": "02:00 PM","duration": "8h", "from": "NDLS","to": "DEST","price_sl": None,"price_3a": 1800,"price_2a": None, "price_1a": None, "days": "Daily"},
        {"id": "t-gen-3","train_no": "22101","name": "Duronto Express",  "departure": "10:00 PM","arrival": "08:00 AM","duration": "10h","from": "NDLS","to": "DEST","price_sl": None,"price_3a": 2000,"price_2a": 2900,"price_1a": 5000,"days": "Tue,Fri,Sun"},
        {"id": "t-gen-4","train_no": "15001","name": "Superfast Express","departure": "08:00 AM","arrival": "08:00 PM","duration": "12h","from": "NDLS","to": "DEST","price_sl": 680, "price_3a": 1780,"price_2a": 2560,"price_1a": 4440,"days": "Daily"},
    ],
    "buses": [
        {"id": "b-gen-1","operator": "KSRTC Airavat",   "type": "Volvo AC Multi-Axle","departure": "09:00 PM","arrival": "06:00 AM","duration": "9h", "from": "Origin","to": "Dest","price": 950, "amenities": "AC, Recliner, Charging"},
        {"id": "b-gen-2","operator": "SRS Travels",     "type": "AC Sleeper",         "departure": "08:00 PM","arrival": "06:00 AM","duration": "10h","from": "Origin","to": "Dest","price": 850, "amenities": "AC, Sleeper, USB"},
        {"id": "b-gen-3","operator": "IntrCity Smart",  "type": "Luxury Sleeper AC",  "departure": "10:30 PM","arrival": "07:30 AM","duration": "9h", "from": "Origin","to": "Dest","price": 1100,"amenities": "AC, 180 Sleeper, Meal, Wi-Fi"},
        {"id": "b-gen-4","operator": "RedBus Premium",  "type": "Semi-Sleeper AC",    "departure": "07:00 PM","arrival": "04:00 AM","duration": "9h", "from": "Origin","to": "Dest","price": 750, "amenities": "AC, Recliner, USB, Water"},
    ],
    "activities": [
        {"id": "a-gen-1", "name": "City Sightseeing Bus Tour","rating": 4.3,"price": 1200,"description": "Hop-on hop-off tour of all key historical monuments."},
        {"id": "a-gen-2", "name": "Local Food Tasting Walk",  "rating": 4.6,"price": 2000,"description": "Guided walking tour sampling the best regional street food."},
        {"id": "a-gen-3", "name": "Heritage Site Day Tour",   "rating": 4.4,"price": 1800,"description": "Explore local historical temples and monuments with a guide."},
    ]
}


def get_destination_data(destination: str) -> Dict[str, Any]:
    for k, v in MOCK_TRAVEL_DB.items():
        if k.lower() == destination.lower():
            return v
    dest_name = destination.title()
    dest_code = destination.upper().replace(" ", "")[:3]
    return {
        "hotels": [
            {"id": "h-custom-1", "name": f"Royal {dest_name} Grand Resort", "rating": 4.8, "price": 14000, "description": f"Luxury 5-star accommodations in the centre of {dest_name}."},
            {"id": "h-custom-2", "name": f"The {dest_name} Palace Hotel",   "rating": 4.6, "price": 11000, "description": "Heritage-style hotel with modern amenities and spa."},
            {"id": "h-custom-3", "name": f"Comfort Suites {dest_name}",     "rating": 4.3, "price": 7500,  "description": "Cozy stay with modern amenities, pool, and buffet."},
            {"id": "h-custom-4", "name": f"Lemon Tree Hotel {dest_name}",   "rating": 4.1, "price": 5200,  "description": "Cheerful modern hotel with restaurant and city connectivity."},
            {"id": "h-custom-5", "name": f"Budget Oasis {dest_name}",       "rating": 4.0, "price": 2800,  "description": "Convenient lodging with clean rooms and local guidance."},
            {"id": "h-custom-6", "name": f"OYO Inn {dest_name} Centre",     "rating": 3.7, "price": 1500,  "description": "Affordable rooms with free Wi-Fi and 24/7 reception."},
        ],
        "flights": [
            {"id": "f-custom-1", "flight_no": "6E-340",  "airline": "IndiGo",   "departure": "08:00 AM","arrival": "11:30 AM","duration": "3h 30m","price": 9500, "route": f"DEL - {dest_code}","class": "Economy"},
            {"id": "f-custom-2", "flight_no": "AI-980",  "airline": "Air India","departure": "04:30 PM","arrival": "08:00 PM","duration": "3h 30m","price": 11200,"route": f"DEL - {dest_code}","class": "Economy"},
            {"id": "f-custom-3", "flight_no": "UK-501",  "airline": "Vistara", "departure": "07:00 AM","arrival": "10:30 AM","duration": "3h 30m","price": 13500,"route": f"DEL - {dest_code}","class": "Economy"},
            {"id": "f-custom-4", "flight_no": "SG-601",  "airline": "SpiceJet","departure": "12:00 PM","arrival": "03:30 PM","duration": "3h 30m","price": 7800, "route": f"DEL - {dest_code}","class": "Economy"},
            {"id": "f-custom-5", "flight_no": "UK-503",  "airline": "Vistara", "departure": "08:00 AM","arrival": "11:30 AM","duration": "3h 30m","price": 28000,"route": f"DEL - {dest_code}","class": "Business"},
        ],
        "trains": [
            {"id": "t-custom-1","train_no": "12001","name": "Rajdhani Express",    "departure": "05:00 PM","arrival": "08:00 AM","duration": "15h","from": "NDLS","to": dest_code,"price_sl": 850, "price_3a": 2200,"price_2a": 3200,"price_1a": 5500,"days": "Daily"},
            {"id": "t-custom-2","train_no": "22001","name": f"{dest_name} Express","departure": "08:00 PM","arrival": "08:00 AM","duration": "12h","from": "NDLS","to": dest_code,"price_sl": 680, "price_3a": 1800,"price_2a": 2600,"price_1a": 4500,"days": "Mon,Wed,Fri"},
            {"id": "t-custom-3","train_no": "12051","name": "Shatabdi Express",    "departure": "06:00 AM","arrival": "02:00 PM","duration": "8h", "from": "NDLS","to": dest_code,"price_sl": None,"price_3a": 1650,"price_2a": None, "price_1a": None,"days": "Daily"},
            {"id": "t-custom-4","train_no": "15001","name": "Superfast Mail",      "departure": "07:30 AM","arrival": "07:30 PM","duration": "12h","from": "NDLS","to": dest_code,"price_sl": 600, "price_3a": 1580,"price_2a": 2275,"price_1a": 3940,"days": "Daily"},
        ],
        "buses": [
            {"id": "b-custom-1","operator": "KSRTC Airavat",    "type": "Volvo AC Multi-Axle","departure": "09:00 PM","arrival": "06:00 AM","duration": "9h", "from": "Origin","to": dest_name,"price": 950, "amenities": "AC, Recliner, Charging"},
            {"id": "b-custom-2","operator": "SRS Travels",      "type": "AC Sleeper",         "departure": "08:00 PM","arrival": "06:00 AM","duration": "10h","from": "Origin","to": dest_name,"price": 820, "amenities": "AC, Sleeper, USB"},
            {"id": "b-custom-3","operator": "IntrCity SmartBus","type": "Luxury Sleeper AC",  "departure": "10:30 PM","arrival": "07:30 AM","duration": "9h", "from": "Origin","to": dest_name,"price": 1150,"amenities": "AC, 180 Sleeper, Meal, Wi-Fi"},
            {"id": "b-custom-4","operator": "VRL Travels",      "type": "Semi-Sleeper AC",    "departure": "07:00 PM","arrival": "04:00 AM","duration": "9h", "from": "Origin","to": dest_name,"price": 780, "amenities": "AC, Recliner, USB, Water"},
        ],
        "activities": [
            {"id": "a-custom-1","name": f"Explore {dest_name} Landmarks",  "rating": 4.6,"price": 2500,"description": f"Guided historical exploration of {dest_name}."},
            {"id": "a-custom-2","name": f"Traditional {dest_name} Dinner", "rating": 4.5,"price": 3000,"description": "Cultural music, dance, and traditional cuisine."},
            {"id": "a-custom-3","name": f"{dest_name} Street Food Walk",   "rating": 4.4,"price": 1200,"description": f"Sample authentic street foods of {dest_name}."},
        ]
    }
