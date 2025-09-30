import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
Deno.serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    // Create Supabase client
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    // Parse request body
    const { user_id, entity_type, entity_id, t_current, t_attempt, lambda_decay, course_id } = await req.json();
    // Validate required parameters
    if (!user_id || !entity_type || entity_id === undefined || !t_current || !t_attempt || lambda_decay === undefined) {
      return new Response(JSON.stringify({
        error: 'Missing required parameters: user_id, entity_type, entity_id, t_current, t_attempt, lambda_decay'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Validate entity_type
    if (![
      'skill',
      'problem_number_type'
    ].includes(entity_type)) {
      return new Response(JSON.stringify({
        error: 'entity_type must be either "skill" or "problem_number_type"'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    console.log(`Processing for user ${user_id}, ${entity_type} ${entity_id} (no decay applied)`);
    // Get alpha and beta using the existing get-alpha-beta function
    const { data: alphaBetaResult, error: alphaBetaError } = await supabaseClient.functions.invoke('get-alpha-beta', {
      body: {
        user_id,
        entity_type,
        entity_id,
        course_id: course_id || '1'
      }
    });
    if (alphaBetaError) {
      console.error('Error getting alpha/beta:', alphaBetaError);
      return new Response(JSON.stringify({
        error: 'Failed to retrieve alpha/beta values',
        details: alphaBetaError.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Check if alpha/beta were found
    const { alpha, beta } = alphaBetaResult.data;
    if (alpha === null || beta === null) {
      console.log(`No alpha/beta found for user ${user_id}, ${entity_type} ${entity_id}`);
      return new Response(JSON.stringify({
        success: true,
        data: {
          alpha_decayed: null,
          beta_decayed: null,
          message: 'No alpha/beta values found for this entity'
        }
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Return alpha and beta unchanged (no decay applied)
    console.log(`Returning unchanged alpha: ${alpha}, beta: ${beta}`);
    return new Response(JSON.stringify({
      success: true,
      data: {
        alpha_decayed: alpha,
        beta_decayed: beta,
        original_alpha: alpha,
        original_beta: beta,
        time_decay: 1,
        delta_days: 0 // Placeholder value
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
