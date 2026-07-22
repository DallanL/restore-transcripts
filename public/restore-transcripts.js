(function() {
    'use strict';

    // 1. Global fallback for downloadTranscript
    window.downloadTranscript = function() {
        const scriptEl = document.querySelector('#transcriptions script');
        if (!scriptEl) return;

        const match = scriptEl.textContent.match(/const transcriptions = (\[.*?\]);/s);
        if (!match) return;

        try {
            const transcriptions = JSON.parse(match[1]);
            if (!transcriptions.length) return;

            let csvContent = 'data:text/csv;charset=utf-8,';
            csvContent += 'Speaker,Sentiment,Comment,Start Time,End Time\n';

            csvContent += transcriptions.map(t => {
                const sentiment = ['Positive', 'Neutral', 'Negative'].includes(t.sentiment) ? t.sentiment : 'Neutral';
                const cleanComment = t.comment.replace(/"/g, '""');
                const startTime = t.start_time ? t.start_time.split(',')[0] : '';
                const endTime = t.end_time ? t.end_time.split(',')[0] : '';
                return `"${t.speaker}","${sentiment}","${cleanComment}","${startTime}","${endTime}"`;
            }).join('\n');

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `call_transcript_${transcriptions[0].fk_job_id || 'export'}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error('Transcript export failed:', e);
        }
    };

    // Safe fallback for close button when audio player isn't loaded
    window.unloadTranscriptionAudio = window.unloadTranscriptionAudio || function() {};

    // 2. Hide player container if audio URL is empty (expired recording)
    function fixTranscriptionModal() {
        const modal = document.querySelector('#transcriptions');
        if (!modal) return;

        const scriptEl = modal.querySelector('script');
        if (!scriptEl) return;

        // Check if the audio URL in the modal's inline script is empty
        const scriptText = scriptEl.textContent;
        const isAudioMissing = /const url = '';/.test(scriptText) || /const url = '(?:\s*)';/.test(scriptText);

        if (isAudioMissing) {
            const playerContainer = modal.querySelector('.transcription-player-container');
            if (playerContainer && playerContainer.style.display !== 'none') {
                playerContainer.style.display = 'none';
            }
        }
    }

    // 3. Process CDR table rows to enable "Listen" buttons on expired calls
    function processRows() {
        document.querySelectorAll('tr[data-job-id]').forEach(row => {
            const jobId = row.getAttribute('data-job-id');
            const origId = row.getAttribute('data-orig-id');
            const termId = row.getAttribute('data-term-id');
            
            if (!jobId || !origId || !termId) return;

            const hasSentiment = row.querySelector('.sentiment-badge-container') !== null;
            const listenBtn = row.querySelector('a.listen.disabled');

            if (hasSentiment && listenBtn) {
                const yearMonth = termId.substring(0, 6);
                const modalUrl = `/portal/callhistory/transcription/${jobId}/${yearMonth}/transcription%2Csentiment%2Csummary%2Ctopics/${origId}/${termId}`;

                listenBtn.classList.remove('disabled');
                listenBtn.classList.add('open-transcription');

                listenBtn.setAttribute('title', 'No Recording, Show Transcript');
                listenBtn.setAttribute('data-original-title', 'No Recording, Show Transcript');
                listenBtn.setAttribute('data-toggle', 'modal');
                listenBtn.setAttribute('data-target', '#transcriptions');
                listenBtn.setAttribute('data-backdrop', 'static');
                listenBtn.setAttribute('onclick', `loadModal('#transcriptions', '${modalUrl}'); return false;`);
            }
        });
    }

    // Observe DOM mutations to catch AJAX loads, pagination, and modal popups
    const observer = new MutationObserver(() => {
        processRows();
        fixTranscriptionModal();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Initial run
    processRows();
    fixTranscriptionModal();
})();
