/**
 * UI Guard: Prevent saving with uncommitted date/time entries.
 * Target: Netsapiens/Portal Timeframe Modal
 */
(function() {
    const SAVE_BTN_ID = 'saveBtn';
    const INPUT_IDS = [
        'selectedDateDatePickerA',
        'time-specific-date-1',
        'selectedDateDatePickerB',
        'time-specific-date-2'
    ];

    const ERROR_MSG = 'Please click the "+" button to add the time frame before saving!';

    // Inject styles for the red bubble
    const style = document.createElement('style');
    style.textContent = `
        .infra-error-bubble {
            position: fixed;
            background-color: #e74c3c;
            color: #ffffff;
            padding: 8px 12px;
            border-radius: 4px;
            font-family: sans-serif;
            font-size: 12px;
            font-weight: bold;
            z-index: 999999;
            pointer-events: none;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
            white-space: nowrap;
            transition: opacity 0.3s ease;
        }
        .infra-error-bubble::after {
            content: "";
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: #e74c3c transparent transparent transparent;
        }
    `;
    document.head.appendChild(style);

    function showBubble(x, y) {
        const bubble = document.createElement('div');
        bubble.className = 'infra-error-bubble';
        bubble.textContent = ERROR_MSG;
        document.body.appendChild(bubble);

        // Position above cursor
        bubble.style.left = `${x - (bubble.offsetWidth / 2)}px`;
        bubble.style.top = `${y - bubble.offsetHeight - 15}px`;

        // Auto-destruct
        setTimeout(() => {
            bubble.style.opacity = '0';
            setTimeout(() => bubble.remove(), 300);
        }, 2000);
    }

    function hasUncommittedData() {
        return INPUT_IDS.some(id => {
            const el = document.getElementById(id);
            return el && el.value.trim() !== "";
        });
    }

    // Attach to the document to handle modal re-renders, 
    // using capture to beat the portal's internal listeners.
    document.addEventListener('click', function(event) {
        const target = event.target;
        
        // Match the save button or its children (if any)
        if (target.id === SAVE_BTN_ID || target.closest(`#${SAVE_BTN_ID}`)) {
            
            // Only enforce if the Specific Dates tab is currently visible
            const sdateTab = document.getElementById('recurring-timeframe-modal-specific-dates');
            const isTabActive = sdateTab && sdateTab.classList.contains('active');

            if (isTabActive && hasUncommittedData()) {
                event.preventDefault();
                event.stopImmediatePropagation();
                
                showBubble(event.clientX, event.clientY);
                
                // Optional: Highlight the inputs briefly
                INPUT_IDS.forEach(id => {
                    const el = document.getElementById(id);
                    if (el && el.value.trim() !== "") {
                        el.style.border = '2px solid #e74c3c';
                        setTimeout(() => el.style.border = '', 2000);
                    }
                });

                console.warn('[InfraGuard] Save blocked: Uncommitted timeframe data detected.');
            }
        }
    }, true); 

    console.log('[InfraGuard] Datepair validation active.');
})();
