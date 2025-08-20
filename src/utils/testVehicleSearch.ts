// Simple isolated test to verify what vehicles.search() actually returns
import { vehicles } from '../services/autoRepairsService';

export const testVehicleSearch = async () => {
  console.log('🧪 === ISOLATED VEHICLE SEARCH TEST ===');
  
  try {
    console.log('🔍 Testing vehicles.search("toyota")...');
    const result = await vehicles.search('toyota');
    
    console.log('✅ SUCCESS - Raw result:', result);
    console.log('📊 Result analysis:', {
      type: typeof result,
      isArray: Array.isArray(result),
      length: result?.length || 0,
      vehicles: result?.map(v => ({
        id: v.id,
        make: v.make,
        model: v.model,
        year: v.year
      })) || []
    });
    
    console.log('🎯 Vehicle makes found:', result?.map(v => v.make) || []);
    
    if (result?.length === 1 && result[0].make === 'Toyota') {
      console.log('✅ CORRECT: Only Toyota found!');
    } else {
      console.log('❌ WRONG: Expected 1 Toyota, got:', result?.length, 'vehicles');
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Error in vehicle search test:', error);
    throw error;
  }
};

// Test function you can call from browser console
(window as any).testVehicleSearch = testVehicleSearch;
