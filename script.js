// Configuration
const CONFIG = {
    API_KEY: '1f81e897-7aff-47e2-a7e9-082aecd8ea35',
    PROXY_URL: 'https://hwcrawler.krsmt0113.workers.dev',
    TARGET_TIME: '2025-10-14T00:00:00Z',
    API_BASE_URL: 'https://api.arkm.com/flow/address'
};

// DOM elements
const walletInput = document.getElementById('walletAddress');
const checkButton = document.getElementById('checkButton');
const resultSection = document.getElementById('result');
const buttonText = checkButton.querySelector('.button-text');
const loadingSpinner = checkButton.querySelector('.loading-spinner');

// Utility functions
function showLoading() {
    checkButton.disabled = true;
    buttonText.style.display = 'none';
    loadingSpinner.style.display = 'block';
}

function hideLoading() {
    checkButton.disabled = false;
    buttonText.style.display = 'block';
    loadingSpinner.style.display = 'none';
}

function showResult(message, isSuccess) {
    resultSection.style.display = 'block';
    resultSection.className = `result-section ${isSuccess ? 'success' : 'error'}`;
    resultSection.querySelector('.result-text').textContent = message;
    
    // Scroll to result
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideResult() {
    resultSection.style.display = 'none';
}

// Render/Remove GMGN link button (placed below the result message)
function renderGmgnButton(walletAddress) {
	const gmgnUrl = `https://gmgn.ai/bsc/address/${walletAddress}`;

	// Ensure a container exists right after the result section
	let actionContainer = document.getElementById('gmgn-action-container');
	if (!actionContainer) {
		actionContainer = document.createElement('div');
		actionContainer.id = 'gmgn-action-container';
		actionContainer.style.marginTop = '1rem';
		// insert after resultSection
		if (resultSection.parentNode) {
			resultSection.parentNode.insertBefore(actionContainer, resultSection.nextSibling);
		}
	}

	// Button element
	let btn = document.getElementById('gmgn-link-btn');
	if (!btn) {
		btn = document.createElement('a');
		btn.id = 'gmgn-link-btn';
		btn.target = '_blank';
		btn.rel = 'noopener noreferrer';
		btn.className = 'check-button';
		btn.style.display = 'inline-block';
		btn.textContent = 'Check PnL on GMGN';
		actionContainer.appendChild(btn);
	}

	btn.href = gmgnUrl;
}

function removeGmgnButton() {
	const container = document.getElementById('gmgn-action-container');
	if (container && container.parentNode) {
		container.parentNode.removeChild(container);
	}
}

function validateWalletAddress(address) {
    if (!address || address.trim() === '') {
        return 'Please enter a wallet address';
    }
    
    // Basic validation for Ethereum/BSC addresses
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(address.trim())) {
        return 'Please enter a valid wallet address (0x...)';
    }
    
    return null;
}

// API call function with proxy
async function checkWalletEligibility(walletAddress) {
    try {
        // Construct the target URL and proxy URL
        const targetUrl = `${CONFIG.API_BASE_URL}/${walletAddress}`;
        const proxyUrl = `${CONFIG.PROXY_URL}?url=${encodeURIComponent(targetUrl)}`;
        
        console.log('Making request to proxy:', proxyUrl);
        console.log('Target URL:', targetUrl);
        
        const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
                'X-API-Key': CONFIG.API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('API response:', data);
        
        return data;
    } catch (error) {
        console.error('API call failed:', error);
        throw new Error(`Failed to fetch wallet data: ${error.message}`);
    }
}

// Process wallet data to check eligibility
function processWalletData(data) {
    try {
        const bscFlows = data.bsc || [];
        
        if (!Array.isArray(bscFlows) || bscFlows.length === 0) {
            return {
                eligible: false,
                message: 'No BSC flows found for this wallet address'
            };
        }
        
        // Find flow with matching time
        const targetTime = new Date(CONFIG.TARGET_TIME);
        let foundFlow = null;
        
        for (const flow of bscFlows) {
            const flowTime = new Date(flow.time);
            if (flowTime.getTime() === targetTime.getTime()) {
                foundFlow = flow;
                break;
            }
        }
        
        if (!foundFlow) {
            return {
                eligible: false,
                message: 'No flow data found for the target time period (2025-10-13)'
            };
        }
        
        // Calculate PnL
        const cumulativeInflow = parseFloat(foundFlow.cumulativeInflow || 0);
        const cumulativeOutflow = parseFloat(foundFlow.cumulativeOutflow || 0);
        const pnl = cumulativeInflow - cumulativeOutflow;
        
        console.log('Flow data:', {
            cumulativeInflow,
            cumulativeOutflow,
            pnl,
            time: foundFlow.time
        });
        
        if (pnl < 0) {
            return {
                eligible: true,
                message: 'You may be eligible for the airdrop! 🎉'
            };
        } else {
            return {
                eligible: false,
                message: 'You may not be eligible for the airdrop'
            };
        }
    } catch (error) {
        console.error('Error processing wallet data:', error);
        return {
            eligible: false,
            message: 'Error processing wallet data',
            details: error.message
        };
    }
}

// Main check function
async function checkEligibility() {
    const walletAddress = walletInput.value.trim();
    
    // Validate input
    const validationError = validateWalletAddress(walletAddress);
    if (validationError) {
        showResult(validationError, false);
        return;
    }
    
    // Hide previous results
    hideResult();
    
    // Show loading state
    showLoading();
    
    try {
        console.log('Starting eligibility check for:', walletAddress);
        console.log('Using API Key:', CONFIG.API_KEY.substring(0, 8) + '...');
        
        // Fetch wallet data
        const walletData = await checkWalletEligibility(walletAddress);
        
        // Process data to check eligibility
        const result = processWalletData(walletData);
        
        // Show result
        const message = result.details ? 
            `${result.message}\n\n${result.details}` : 
            result.message;
        showResult(message, result.eligible);

		// Show GMGN button only when not eligible
		if (!result.eligible) {
			renderGmgnButton(walletAddress);
		} else {
			removeGmgnButton();
		}
        
    } catch (error) {
        console.error('Check failed:', error);
        showResult(`Error: ${error.message}`, false);
		// On error, remove GMGN button to avoid misleading action
		removeGmgnButton();
    } finally {
        hideLoading();
    }
}

// Event listeners
checkButton.addEventListener('click', checkEligibility);

walletInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkEligibility();
    }
});

// Clear result when user starts typing
walletInput.addEventListener('input', () => {
    if (resultSection.style.display !== 'none') {
        hideResult();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Four.meme loser airdrop checker initialized');
    console.log('Configuration:', {
        proxyUrl: CONFIG.PROXY_URL,
        targetTime: CONFIG.TARGET_TIME
    });
    
    // Focus on input field
    walletInput.focus();
});

// Add some helpful console messages
console.log(`
🚀 Four.meme loser airdrop checker loaded!

Features:
- Proxy-enabled API calls to avoid CORS issues
- Real-time wallet eligibility checking
- Modern, responsive UI
- Error handling and validation

API Configuration:
- Proxy: ${CONFIG.PROXY_URL}
- Target Time: ${CONFIG.TARGET_TIME}
- API Key: ${CONFIG.API_KEY.substring(0, 8)}...
`);

