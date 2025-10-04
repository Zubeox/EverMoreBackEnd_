import { supabase } from '../lib/supabase';

export async function debugSupabaseConnection() {
    console.log('=== SUPABASE DEBUG INFO ===');
    
    try {
        // 1. Test SELECT
        console.log('Testing SELECT...');
        const { data: selectData, error: selectError } = await supabase
            .from('galleries')
            .select('*')
            .limit(1);
        console.log('SELECT test:', { 
            success: !selectError,
            count: selectData?.length,
            error: selectError
        });
        
        // 2. Test INSERT
        console.log('Testing INSERT...');
        const testData = {
            title: 'Debug Test Gallery',
            subtitle: 'Test Insert',
            event_date: new Date().toISOString().split('T')[0]
        };
        
        const { data: insertData, error: insertError } = await supabase
            .from('galleries')
            .insert([testData])
            .select()
            .single();
            
        console.log('INSERT test:', {
            success: !insertError,
            data: insertData,
            error: insertError
        });
        
        // 3. Clean up test data if insert succeeded
        if (insertData?.id) {
            console.log('Cleaning up test data...');
            const { error: deleteError } = await supabase
                .from('galleries')
                .delete()
                .eq('id', insertData.id);
                
            console.log('Cleanup result:', {
                success: !deleteError,
                error: deleteError
            });
        }
        
    } catch (e) {
        console.error('Unexpected error during debug:', e);
    }
    
    console.log('=== END DEBUG INFO ===');
}