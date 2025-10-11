import { describe, it, expect, beforeAll } from 'vitest';
import { supabase } from '../../src/supabase';

describe('Supabase Client Connection', () => {
  describe('Client Initialization', () => {
    it('should create supabase client instance', () => {
      expect(supabase).toBeDefined();
      expect(supabase).not.toBeNull();
    });

    it('should have required supabase client methods', () => {
      expect(supabase.from).toBeDefined();
      expect(typeof supabase.from).toBe('function');
      expect(supabase.auth).toBeDefined();
      expect(supabase.storage).toBeDefined();
    });

    it('should have proper client configuration', () => {
      // @ts-ignore - accessing internal properties for testing
      const clientUrl = supabase.supabaseUrl;
      expect(clientUrl).toBeDefined();
      expect(typeof clientUrl).toBe('string');
    });
  });

  describe('Connection Verification', () => {
    it('should be able to get service status', async () => {
      // This test attempts a lightweight query to verify connectivity
      // Using a simple select that should not fail even if table doesn't exist
      try {
        const { error } = await supabase
          .from('_health_check')
          .select('*')
          .limit(0);
        
        // If we get a specific error about table not existing, connection is working
        // If we get a network error, connection is not working
        if (error) {
          // Table not found error means we connected successfully
          expect(error.code).toBeTruthy();
          // Should not be a network error
          expect(error.message).not.toContain('network');
          expect(error.message).not.toContain('Failed to fetch');
        }
      } catch (err) {
        // If there's a network error, the test should fail
        expect(err).toBeUndefined();
      }
    });

    it('should have valid auth client', () => {
      expect(supabase.auth).toBeDefined();
      expect(supabase.auth.getSession).toBeDefined();
      expect(typeof supabase.auth.getSession).toBe('function');
    });

    it('should be able to call auth methods', async () => {
      // Test that auth methods are callable
      const { data, error } = await supabase.auth.getSession();
      
      // We expect no error calling the method (even if no session exists)
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.session).toBeNull(); // No active session expected in tests
    });
  });

  describe('Environment Configuration', () => {
    it('should have client URL configured', () => {
      // @ts-ignore - accessing internal properties for testing
      const clientUrl = supabase.supabaseUrl;
      
      expect(clientUrl).toBeDefined();
      expect(typeof clientUrl).toBe('string');
      expect(clientUrl.length).toBeGreaterThan(0);
    });

    it('should have valid supabase URL format', () => {
      // @ts-ignore - accessing internal properties for testing
      const clientUrl = supabase.supabaseUrl;
      
      if (clientUrl) {
        // Check if it's a valid URL
        expect(() => new URL(clientUrl)).not.toThrow();
        
        // Supabase URLs typically contain 'supabase'
        expect(clientUrl.toLowerCase()).toContain('supabase');
      }
    });

    it('should have authentication key configured', () => {
      // @ts-ignore - accessing internal properties for testing
      const clientKey = supabase.supabaseKey;
      
      expect(clientKey).toBeDefined();
      expect(typeof clientKey).toBe('string');
      // Supabase anon keys are typically JWT tokens, which are quite long
      expect(clientKey.length).toBeGreaterThan(20);
    });
  });

  describe('Database Operations', () => {
    it('should be able to create a query builder', () => {
      const queryBuilder = supabase.from('test_table');
      
      expect(queryBuilder).toBeDefined();
      expect(queryBuilder.select).toBeDefined();
      expect(typeof queryBuilder.select).toBe('function');
    });

    it('should have storage client available', () => {
      expect(supabase.storage).toBeDefined();
      expect(supabase.storage.from).toBeDefined();
      expect(typeof supabase.storage.from).toBe('function');
    });
  });
});

