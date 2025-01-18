import axios from 'axios';

const API_URL = 'https://petstore.swagger.io/v2';

// Meningkatkan timeout default untuk semua test
jest.setTimeout(30000);

describe('User API Tests', () => {
  // Menggunakan timestamp untuk username yang unik
  const timestamp = Date.now();
  const username = `testuser${timestamp}`;
  const updatedEmail = `updated${timestamp}@test.com`;

  const userData = {
    id: 123, // Menggunakan ID yang lebih kecil
    username: username,
    firstName: 'Test',
    lastName: 'User',
    email: `test${timestamp}@test.com`,
    password: 'password123',
    phone: '08123456789',
    userStatus: 0
  };

  const updateData = {
    ...userData,
    email: updatedEmail
  };

  let userId: number;

  // Helper function untuk delay
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Membersihkan user setelah semua test selesai
  afterAll(async () => {
    try {
      await axios.delete(`${API_URL}/user/${username}`);
      console.log('Cleanup successful');
    } catch (error) {
      console.log('Cleanup error:', error);
    }
  });

  // Test create user
  it('should create a new user', async () => {
    console.log('Creating user with data:', userData);
    
    const response = await axios.post(`${API_URL}/user`, userData, {
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      }
    });

    console.log('Create user response:', response.data);
    
    expect(response.status).toBe(200);
    expect(response.data.code).toBe(200);
    expect(response.data.message).toBeTruthy();

    // Tunggu sebentar untuk memastikan data tersimpan
    console.log('Waiting for user creation to be processed...');
    await delay(2000);
  }, 10000);

  // Test get user
  it('should get user by username', async () => {
    console.log('Getting user with username:', username);
    
    const response = await axios.get(`${API_URL}/user/${username}`, {
      headers: {
        'accept': 'application/json'
      }
    });

    console.log('Get user response:', response.data);
    
    expect(response.status).toBe(200);
    expect(response.data.username).toBe(username);
    expect(response.data.email).toBe(userData.email);

    // Simpan ID untuk digunakan dalam update
    userId = response.data.id;
  });

  // Test update user
  it('should update user information', async () => {
    console.log('Updating user with data:', updateData);

    // Mencoba update beberapa kali dengan delay
    for (let i = 0; i < 3; i++) {
      const updateResponse = await axios.put(`${API_URL}/user/${username}`, updateData, {
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        }
      });

      console.log(`Update attempt ${i + 1} response:`, updateResponse.data);
      
      // Tunggu sebentar antara setiap percobaan
      console.log('Waiting for update to be processed...');
      await delay(2000);

      // Cek apakah update berhasil
      const getResponse = await axios.get(`${API_URL}/user/${username}`, {
        headers: {
          'accept': 'application/json'
        }
      });

      console.log(`Verification attempt ${i + 1} response:`, getResponse.data);

      if (getResponse.data.email === updatedEmail) {
        console.log('Update successful!');
        expect(getResponse.data.email).toBe(updatedEmail);
        return;
      }

      console.log(`Update attempt ${i + 1} failed, trying again...`);
      await delay(2000);
    }

    // Jika semua percobaan gagal, gagalkan test
    throw new Error('Failed to update user after multiple attempts');
  }, 30000);
});
