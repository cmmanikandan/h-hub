// Indian States and Districts Data
export const statesAndDistricts = {
    'Tamil Nadu': [
        'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
        'Tirunelveli', 'Tiruppur', 'Erode', 'Vellore', 'Thoothukudi',
        'Thanjavur', 'Dindigul', 'Kanchipuram', 'Cuddalore', 'Karur'
    ],
    'Karnataka': [
        'Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Mangaluru', 'Hubballi-Dharwad',
        'Belagavi', 'Kalaburagi', 'Ballari', 'Vijayapura', 'Shivamogga'
    ],
    'Kerala': [
        'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam',
        'Palakkad', 'Alappuzha', 'Kannur', 'Kottayam', 'Malappuram'
    ],
    'Maharashtra': [
        'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik',
        'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Nanded'
    ],
    'Andhra Pradesh': [
        'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool',
        'Rajahmundry', 'Tirupati', 'Kakinada', 'Anantapur', 'Kadapa'
    ],
    'Telangana': [
        'Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar',
        'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Medak', 'Rangareddy'
    ],
    'Gujarat': [
        'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar',
        'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Mehsana'
    ],
    'Rajasthan': [
        'Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer',
        'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar'
    ],
    'West Bengal': [
        'Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri',
        'Bardhaman', 'Malda', 'Baharampur', 'Habra', 'Kharagpur'
    ],
    'Uttar Pradesh': [
        'Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi',
        'Meerut', 'Allahabad', 'Bareilly', 'Aligarh', 'Moradabad'
    ],
    'Delhi': [
        'Central Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi',
        'North East Delhi', 'North West Delhi', 'South East Delhi', 'South West Delhi', 'New Delhi'
    ],
    'Punjab': [
        'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda',
        'Mohali', 'Hoshiarpur', 'Pathankot', 'Moga', 'Firozpur'
    ],
    'Haryana': [
        'Faridabad', 'Gurgaon', 'Panipat', 'Ambala', 'Yamunanagar',
        'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula'
    ],
    'Madhya Pradesh': [
        'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain',
        'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa'
    ],
    'Bihar': [
        'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga',
        'Purnia', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar'
    ],
    'Odisha': [
        'Bhubaneswar', 'Cuttack', 'Rourkela', 'Brahmapur', 'Sambalpur',
        'Puri', 'Balasore', 'Bhadrak', 'Baripada', 'Jharsuguda'
    ],
    'Assam': [
        'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon',
        'Tinsukia', 'Tezpur', 'Bongaigaon', 'Dhubri', 'Goalpara'
    ],
    'Jharkhand': [
        'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar',
        'Hazaribagh', 'Giridih', 'Ramgarh', 'Medininagar', 'Chirkunda'
    ],
    'Uttarakhand': [
        'Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur',
        'Kashipur', 'Rishikesh', 'Pithoragarh', 'Nainital', 'Almora'
    ],
    'Himachal Pradesh': [
        'Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Palampur',
        'Baddi', 'Nahan', 'Una', 'Kullu', 'Hamirpur'
    ],
    'Chhattisgarh': [
        'Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg',
        'Rajnandgaon', 'Jagdalpur', 'Raigarh', 'Ambikapur', 'Dhamtari'
    ],
    'Goa': [
        'North Goa', 'South Goa'
    ],
    'Puducherry': [
        'Puducherry', 'Karaikal', 'Mahe', 'Yanam'
    ]
};

export const getDistrictsByState = (state) => {
    return statesAndDistricts[state] || [];
};

export const getAllStates = () => {
    return Object.keys(statesAndDistricts).sort();
};
