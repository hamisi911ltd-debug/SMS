// Fallback script loader for when CDNs fail
(function() {
    'use strict';
    
    // Check if Chart.js loaded
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js failed to load from CDN, using fallback');
        // Create a minimal Chart fallback
        window.Chart = function(ctx, config) {
            console.log('Chart.js fallback - chart would be created here');
            return {
                destroy: function() {},
                update: function() {},
                data: config.data || {}
            };
        };
    }
    
    // Check if HTMX loaded
    if (typeof htmx === 'undefined') {
        console.warn('HTMX failed to load from CDN, using fallback');
        // Create a minimal HTMX fallback
        window.htmx = {
            process: function() {},
            trigger: function() {},
            ajax: function() {}
        };
    }
    
    // Check if Socket.IO loaded
    if (typeof io === 'undefined') {
        console.warn('Socket.IO failed to load, using fallback');
        // Create a minimal Socket.IO fallback
        window.io = function() {
            return {
                on: function() {},
                emit: function() {},
                disconnect: function() {}
            };
        };
    }
    
    console.log('Fallback scripts initialized');
})();