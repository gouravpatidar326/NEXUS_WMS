// Comprehensive international country, state, city, zip code, and phone dial code database

export const COUNTRIES = [
  {
    name: 'India',
    code: 'IN',
    flag: '🇮🇳',
    dialCode: '+91',
    states: [
      {
        name: 'Delhi',
        cities: [
          { name: 'New Delhi', zipCode: '110001' },
          { name: 'Dwarka', zipCode: '110075' },
          { name: 'Rohini', zipCode: '110085' },
          { name: 'South Delhi', zipCode: '110017' },
          { name: 'Connaught Place', zipCode: '110001' },
          { name: 'Chandni Chowk', zipCode: '110006' },
        ],
      },
      {
        name: 'Maharashtra',
        cities: [
          { name: 'Mumbai', zipCode: '400001' },
          { name: 'Pune', zipCode: '411001' },
          { name: 'Nagpur', zipCode: '440001' },
          { name: 'Thane', zipCode: '400601' },
          { name: 'Nashik', zipCode: '422001' },
        ],
      },
      {
        name: 'Karnataka',
        cities: [
          { name: 'Bengaluru', zipCode: '560001' },
          { name: 'Mysuru', zipCode: '570001' },
          { name: 'Hubballi', zipCode: '580001' },
          { name: 'Mangaluru', zipCode: '575001' },
        ],
      },
      {
        name: 'Tamil Nadu',
        cities: [
          { name: 'Chennai', zipCode: '600001' },
          { name: 'Coimbatore', zipCode: '641001' },
          { name: 'Madurai', zipCode: '625001' },
          { name: 'Tiruchirappalli', zipCode: '620001' },
        ],
      },
      {
        name: 'Telangana',
        cities: [
          { name: 'Hyderabad', zipCode: '500001' },
          { name: 'Warangal', zipCode: '506001' },
          { name: 'Nizamabad', zipCode: '503001' },
        ],
      },
      {
        name: 'Gujarat',
        cities: [
          { name: 'Ahmedabad', zipCode: '380001' },
          { name: 'Surat', zipCode: '395001' },
          { name: 'Vadodara', zipCode: '390001' },
          { name: 'Rajkot', zipCode: '360001' },
        ],
      },
      {
        name: 'Uttar Pradesh',
        cities: [
          { name: 'Noida', zipCode: '201301' },
          { name: 'Lucknow', zipCode: '226001' },
          { name: 'Kanpur', zipCode: '208001' },
          { name: 'Agra', zipCode: '282001' },
          { name: 'Varanasi', zipCode: '221001' },
          { name: 'Ghaziabad', zipCode: '201001' },
        ],
      },
      {
        name: 'West Bengal',
        cities: [
          { name: 'Kolkata', zipCode: '700001' },
          { name: 'Howrah', zipCode: '711101' },
          { name: 'Durgapur', zipCode: '713201' },
          { name: 'Siliguri', zipCode: '734001' },
        ],
      },
      {
        name: 'Rajasthan',
        cities: [
          { name: 'Jaipur', zipCode: '302001' },
          { name: 'Jodhpur', zipCode: '342001' },
          { name: 'Udaipur', zipCode: '313001' },
          { name: 'Kota', zipCode: '324001' },
        ],
      },
      {
        name: 'Haryana',
        cities: [
          { name: 'Gurugram', zipCode: '122001' },
          { name: 'Faridabad', zipCode: '121001' },
          { name: 'Panipat', zipCode: '132103' },
          { name: 'Ambala', zipCode: '133001' },
        ],
      },
      {
        name: 'Punjab',
        cities: [
          { name: 'Chandigarh', zipCode: '160017' },
          { name: 'Ludhiana', zipCode: '141001' },
          { name: 'Amritsar', zipCode: '143001' },
          { name: 'Jalandhar', zipCode: '144001' },
        ],
      },
      {
        name: 'Kerala',
        cities: [
          { name: 'Kochi', zipCode: '682001' },
          { name: 'Thiruvananthapuram', zipCode: '695001' },
          { name: 'Kozhikode', zipCode: '673001' },
        ],
      },
      {
        name: 'Madhya Pradesh',
        cities: [
          { name: 'Indore', zipCode: '452001' },
          { name: 'Bhopal', zipCode: '462001' },
          { name: 'Gwalior', zipCode: '474001' },
          { name: 'Jabalpur', zipCode: '482001' },
        ],
      },
    ],
  },
  {
    name: 'United States',
    code: 'US',
    flag: '🇺🇸',
    dialCode: '+1',
    states: [
      {
        name: 'Alabama',
        cities: [{ name: 'Montgomery', zipCode: '36104' }, { name: 'Birmingham', zipCode: '35203' }],
      },
      {
        name: 'Alaska',
        cities: [{ name: 'Juneau', zipCode: '99801' }, { name: 'Anchorage', zipCode: '99501' }],
      },
      {
        name: 'Arizona',
        cities: [{ name: 'Phoenix', zipCode: '85001' }, { name: 'Tucson', zipCode: '85701' }],
      },
      {
        name: 'Arkansas',
        cities: [{ name: 'Little Rock', zipCode: '72201' }, { name: 'Fayetteville', zipCode: '72701' }],
      },
      {
        name: 'California',
        cities: [
          { name: 'Los Angeles', zipCode: '90001' },
          { name: 'San Francisco', zipCode: '94102' },
          { name: 'San Jose', zipCode: '95101' },
          { name: 'San Diego', zipCode: '92101' },
          { name: 'Sacramento', zipCode: '95814' },
        ],
      },
      {
        name: 'Colorado',
        cities: [{ name: 'Denver', zipCode: '80202' }, { name: 'Colorado Springs', zipCode: '80903' }],
      },
      {
        name: 'Connecticut',
        cities: [{ name: 'Hartford', zipCode: '06103' }, { name: 'New Haven', zipCode: '06510' }],
      },
      {
        name: 'Delaware',
        cities: [{ name: 'Dover', zipCode: '19901' }, { name: 'Wilmington', zipCode: '19801' }],
      },
      {
        name: 'Florida',
        cities: [
          { name: 'Miami', zipCode: '33101' },
          { name: 'Orlando', zipCode: '32801' },
          { name: 'Tampa', zipCode: '33601' },
          { name: 'Jacksonville', zipCode: '32201' },
          { name: 'Tallahassee', zipCode: '32301' },
        ],
      },
      {
        name: 'Georgia',
        cities: [{ name: 'Atlanta', zipCode: '30303' }, { name: 'Savannah', zipCode: '31401' }],
      },
      {
        name: 'Hawaii',
        cities: [{ name: 'Honolulu', zipCode: '96813' }, { name: 'Hilo', zipCode: '96720' }],
      },
      {
        name: 'Idaho',
        cities: [{ name: 'Boise', zipCode: '83702' }, { name: 'Idaho Falls', zipCode: '83402' }],
      },
      {
        name: 'Illinois',
        cities: [
          { name: 'Chicago', zipCode: '60601' },
          { name: 'Aurora', zipCode: '60502' },
          { name: 'Naperville', zipCode: '60540' },
          { name: 'Springfield', zipCode: '62701' },
        ],
      },
      {
        name: 'Indiana',
        cities: [{ name: 'Indianapolis', zipCode: '46204' }, { name: 'Fort Wayne', zipCode: '46802' }],
      },
      {
        name: 'Iowa',
        cities: [{ name: 'Des Moines', zipCode: '50309' }, { name: 'Cedar Rapids', zipCode: '52401' }],
      },
      {
        name: 'Kansas',
        cities: [{ name: 'Topeka', zipCode: '66603' }, { name: 'Wichita', zipCode: '67202' }],
      },
      {
        name: 'Kentucky',
        cities: [{ name: 'Frankfort', zipCode: '40601' }, { name: 'Louisville', zipCode: '40202' }],
      },
      {
        name: 'Louisiana',
        cities: [{ name: 'Baton Rouge', zipCode: '70802' }, { name: 'New Orleans', zipCode: '70112' }],
      },
      {
        name: 'Maine',
        cities: [{ name: 'Augusta', zipCode: '04330' }, { name: 'Portland', zipCode: '04101' }],
      },
      {
        name: 'Maryland',
        cities: [{ name: 'Annapolis', zipCode: '21401' }, { name: 'Baltimore', zipCode: '21202' }],
      },
      {
        name: 'Massachusetts',
        cities: [{ name: 'Boston', zipCode: '02108' }, { name: 'Worcester', zipCode: '01608' }],
      },
      {
        name: 'Michigan',
        cities: [{ name: 'Lansing', zipCode: '48933' }, { name: 'Detroit', zipCode: '48226' }],
      },
      {
        name: 'Minnesota',
        cities: [{ name: 'St. Paul', zipCode: '55102' }, { name: 'Minneapolis', zipCode: '55401' }],
      },
      {
        name: 'Mississippi',
        cities: [{ name: 'Jackson', zipCode: '39201' }, { name: 'Gulfport', zipCode: '39501' }],
      },
      {
        name: 'Missouri',
        cities: [{ name: 'Jefferson City', zipCode: '65101' }, { name: 'Kansas City', zipCode: '64106' }],
      },
      {
        name: 'Montana',
        cities: [{ name: 'Helena', zipCode: '59601' }, { name: 'Billings', zipCode: '59101' }],
      },
      {
        name: 'Nebraska',
        cities: [{ name: 'Lincoln', zipCode: '68508' }, { name: 'Omaha', zipCode: '68102' }],
      },
      {
        name: 'Nevada',
        cities: [{ name: 'Carson City', zipCode: '89701' }, { name: 'Las Vegas', zipCode: '89101' }],
      },
      {
        name: 'New Hampshire',
        cities: [{ name: 'Concord', zipCode: '03301' }, { name: 'Manchester', zipCode: '03101' }],
      },
      {
        name: 'New Jersey',
        cities: [{ name: 'Trenton', zipCode: '08608' }, { name: 'Newark', zipCode: '07102' }],
      },
      {
        name: 'New Mexico',
        cities: [{ name: 'Santa Fe', zipCode: '87501' }, { name: 'Albuquerque', zipCode: '87102' }],
      },
      {
        name: 'New York',
        cities: [
          { name: 'Albany', zipCode: '12207' },
          { name: 'New York City', zipCode: '10001' },
          { name: 'Buffalo', zipCode: '14201' },
          { name: 'Rochester', zipCode: '14604' },
        ],
      },
      {
        name: 'North Carolina',
        cities: [{ name: 'Raleigh', zipCode: '27601' }, { name: 'Charlotte', zipCode: '28202' }],
      },
      {
        name: 'North Dakota',
        cities: [{ name: 'Bismarck', zipCode: '58501' }, { name: 'Fargo', zipCode: '58102' }],
      },
      {
        name: 'Ohio',
        cities: [{ name: 'Columbus', zipCode: '43215' }, { name: 'Cleveland', zipCode: '44114' }],
      },
      {
        name: 'Oklahoma',
        cities: [{ name: 'Oklahoma City', zipCode: '73102' }, { name: 'Tulsa', zipCode: '74103' }],
      },
      {
        name: 'Oregon',
        cities: [{ name: 'Salem', zipCode: '97301' }, { name: 'Portland', zipCode: '97204' }],
      },
      {
        name: 'Pennsylvania',
        cities: [{ name: 'Harrisburg', zipCode: '17101' }, { name: 'Philadelphia', zipCode: '19102' }],
      },
      {
        name: 'Rhode Island',
        cities: [{ name: 'Providence', zipCode: '02903' }, { name: 'Warwick', zipCode: '02886' }],
      },
      {
        name: 'South Carolina',
        cities: [{ name: 'Columbia', zipCode: '29201' }, { name: 'Charleston', zipCode: '29401' }],
      },
      {
        name: 'South Dakota',
        cities: [{ name: 'Pierre', zipCode: '57501' }, { name: 'Sioux Falls', zipCode: '57104' }],
      },
      {
        name: 'Tennessee',
        cities: [{ name: 'Nashville', zipCode: '37219' }, { name: 'Memphis', zipCode: '38103' }],
      },
      {
        name: 'Texas',
        cities: [
          { name: 'Austin', zipCode: '78701' },
          { name: 'Houston', zipCode: '77001' },
          { name: 'Dallas', zipCode: '75201' },
          { name: 'San Antonio', zipCode: '78201' },
        ],
      },
      {
        name: 'Utah',
        cities: [{ name: 'Salt Lake City', zipCode: '84111' }, { name: 'Provo', zipCode: '84601' }],
      },
      {
        name: 'Vermont',
        cities: [{ name: 'Montpelier', zipCode: '05602' }, { name: 'Burlington', zipCode: '05401' }],
      },
      {
        name: 'Virginia',
        cities: [{ name: 'Richmond', zipCode: '23219' }, { name: 'Virginia Beach', zipCode: '23451' }],
      },
      {
        name: 'Washington',
        cities: [
          { name: 'Olympia', zipCode: '98501' },
          { name: 'Seattle', zipCode: '98101' },
          { name: 'Spokane', zipCode: '99201' },
          { name: 'Tacoma', zipCode: '98401' },
        ],
      },
      {
        name: 'West Virginia',
        cities: [{ name: 'Charleston', zipCode: '25301' }, { name: 'Huntington', zipCode: '25701' }],
      },
      {
        name: 'Wisconsin',
        cities: [{ name: 'Madison', zipCode: '53703' }, { name: 'Milwaukee', zipCode: '53202' }],
      },
      {
        name: 'Wyoming',
        cities: [{ name: 'Cheyenne', zipCode: '82001' }, { name: 'Casper', zipCode: '82601' }],
      }
    ],
  },
  {
    name: 'United Kingdom',
    code: 'GB',
    flag: '🇬🇧',
    dialCode: '+44',
    states: [
      {
        name: 'England',
        cities: [
          { name: 'London', zipCode: 'EC1A 1BB' },
          { name: 'Manchester', zipCode: 'M1 1AG' },
          { name: 'Birmingham', zipCode: 'B1 1AA' },
          { name: 'Leeds', zipCode: 'LS1 1UR' },
          { name: 'Liverpool', zipCode: 'L1 1DA' },
        ],
      },
      {
        name: 'Scotland',
        cities: [
          { name: 'Edinburgh', zipCode: 'EH1 1YZ' },
          { name: 'Glasgow', zipCode: 'G1 1QX' },
          { name: 'Aberdeen', zipCode: 'AB10 1XG' },
        ],
      },
      {
        name: 'Wales',
        cities: [
          { name: 'Cardiff', zipCode: 'CF10 1DD' },
          { name: 'Swansea', zipCode: 'SA1 1NW' },
        ],
      },
    ],
  },
  {
    name: 'Canada',
    code: 'CA',
    flag: '🇨🇦',
    dialCode: '+1',
    states: [
      {
        name: 'Ontario',
        cities: [
          { name: 'Toronto', zipCode: 'M5V 2T6' },
          { name: 'Ottawa', zipCode: 'K1P 1J1' },
          { name: 'Mississauga', zipCode: 'L5B 1M2' },
        ],
      },
      {
        name: 'Quebec',
        cities: [
          { name: 'Montreal', zipCode: 'H2X 1Y6' },
          { name: 'Quebec City', zipCode: 'G1R 2L7' },
        ],
      },
      {
        name: 'British Columbia',
        cities: [
          { name: 'Vancouver', zipCode: 'V6B 1A1' },
          { name: 'Victoria', zipCode: 'V8W 1P6' },
        ],
      },
    ],
  },
  {
    name: 'Australia',
    code: 'AU',
    flag: '🇦🇺',
    dialCode: '+61',
    states: [
      {
        name: 'New South Wales',
        cities: [
          { name: 'Sydney', zipCode: '2000' },
          { name: 'Newcastle', zipCode: '2300' },
        ],
      },
      {
        name: 'Victoria',
        cities: [
          { name: 'Melbourne', zipCode: '3000' },
          { name: 'Geelong', zipCode: '3220' },
        ],
      },
      {
        name: 'Queensland',
        cities: [
          { name: 'Brisbane', zipCode: '4000' },
          { name: 'Gold Coast', zipCode: '4217' },
        ],
      },
    ],
  },
  {
    name: 'Germany',
    code: 'DE',
    flag: '🇩🇪',
    dialCode: '+49',
    states: [
      {
        name: 'Bavaria',
        cities: [
          { name: 'Munich', zipCode: '80331' },
          { name: 'Nuremberg', zipCode: '90402' },
        ],
      },
      {
        name: 'Berlin',
        cities: [{ name: 'Berlin', zipCode: '10115' }],
      },
      {
        name: 'North Rhine-Westphalia',
        cities: [
          { name: 'Cologne', zipCode: '50667' },
          { name: 'Düsseldorf', zipCode: '40213' },
        ],
      },
    ],
  },
  {
    name: 'United Arab Emirates',
    code: 'AE',
    flag: '🇦🇪',
    dialCode: '+971',
    states: [
      {
        name: 'Dubai',
        cities: [
          { name: 'Dubai City', zipCode: '00000' },
          { name: 'Jebel Ali', zipCode: '00000' },
          { name: 'Deira', zipCode: '00000' },
        ],
      },
      {
        name: 'Abu Dhabi',
        cities: [
          { name: 'Abu Dhabi City', zipCode: '00000' },
          { name: 'Al Ain', zipCode: '00000' },
        ],
      },
      {
        name: 'Sharjah',
        cities: [{ name: 'Sharjah City', zipCode: '00000' }],
      },
    ],
  },
  {
    name: 'Singapore',
    code: 'SG',
    flag: '🇸🇬',
    dialCode: '+65',
    states: [
      {
        name: 'Central Region',
        cities: [
          { name: 'Singapore City', zipCode: '018989' },
          { name: 'Orchard', zipCode: '238801' },
          { name: 'Marina Bay', zipCode: '018956' },
        ],
      },
    ],
  },
  {
    name: 'Japan',
    code: 'JP',
    flag: '🇯🇵',
    dialCode: '+81',
    states: [
      {
        name: 'Kanto',
        cities: [
          { name: 'Tokyo', zipCode: '100-0001' },
          { name: 'Yokohama', zipCode: '220-0011' },
        ],
      },
      {
        name: 'Kansai',
        cities: [
          { name: 'Osaka', zipCode: '530-0001' },
          { name: 'Kyoto', zipCode: '600-8001' },
        ],
      },
    ],
  },
  {
    name: 'France',
    code: 'FR',
    flag: '🇫🇷',
    dialCode: '+33',
    states: [
      {
        name: 'Île-de-France',
        cities: [{ name: 'Paris', zipCode: '75001' }],
      },
      {
        name: 'Provence-Alpes-Côte d\'Azur',
        cities: [
          { name: 'Marseille', zipCode: '13001' },
          { name: 'Nice', zipCode: '06000' },
        ],
      },
    ],
  },
];

// Helper functions for lookup
export const getCountryByDialCode = (code) => {
  if (!code) return COUNTRIES[0];
  const cleaned = code.trim();
  return (
    COUNTRIES.find((c) => cleaned.startsWith(c.dialCode) || c.dialCode === cleaned) || COUNTRIES[0]
  );
};

export const getCountryByName = (name) => {
  if (!name) return COUNTRIES[0];
  return COUNTRIES.find((c) => c.name.toLowerCase() === name.toLowerCase()) || COUNTRIES[0];
};
