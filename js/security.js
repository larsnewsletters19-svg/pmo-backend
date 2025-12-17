// ============================================
// PMO AI ASSISTANT - SECURITY FUNCTIONS
// v8.7.0 - Code Split
// ============================================

// Guard against duplicate loading
if (window.SecurityFunctionsLoaded) {
    console.warn('⚠️ security.js already loaded, skipping duplicate');
    // Don't throw error, just exit early
} else {
    window.SecurityFunctionsLoaded = true;

// NOTE: These are PURE functions that only transform data.
// They depend on data passed as parameters (no React state access).
// UI-related functions (load/save/modals) remain in app.js

// ============================================
// ANONYMIZATION - Pure transformation functions
// ============================================

/**
 * Generate anonymization code based on type
 * @param {string} type - 'person', 'organization', 'location', 'identifier'
 * @param {array} existingCodes - Array of existing codes to avoid duplicates
 * @returns {string} Generated code (e.g. 'PERSON_1', 'ORG_2')
 */
function generateAnonymizationCode(type, existingCodes) {
    const prefix = {
        'person': 'PERSON',
        'organization': 'ORG',
        'location': 'LOC',
        'identifier': 'ID'
    }[type];
    
    let counter = 1;
    let code = `${prefix}_${counter}`;
    
    while (existingCodes.includes(code)) {
        counter++;
        code = `${prefix}_${counter}`;
    }
    
    return code;
}

/**
 * Replace original values with anonymization codes
 * @param {string} text - Original text
 * @param {array} anonymizationEntries - Array of {original_value, anonymized_code, entry_type}
 * @returns {string} Text with anonymization codes
 */
function replaceWithAnonymizationCodes(text, anonymizationEntries) {
    if (!text || !anonymizationEntries || anonymizationEntries.length === 0) {
        console.log('⚠️ No anonymization: text empty or no entries');
        return text;
    }
    
    console.log('🔒 === ANONYMIZATION DEBUG START ===');
    console.log('🔒 Available entries:', anonymizationEntries.length);
    anonymizationEntries.forEach(entry => {
        console.log(`  - "${entry.original_value}" (${entry.entry_type}) → ${entry.anonymized_code}`);
    });
    
    console.log('🔒 Text BEFORE anonymization (first 300 chars):');
    console.log(text.substring(0, 300));
    
    let processedText = text;
    
    // Sort by length (longest first) to avoid partial matches
    const sortedEntries = [...anonymizationEntries].sort((a, b) => 
        b.original_value.length - a.original_value.length
    );
    
    sortedEntries.forEach(entry => {
        // Escape special regex characters in the original value
        const escapedValue = entry.original_value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Case-insensitive replacement with word boundaries
        const regex = new RegExp(`\\b${escapedValue}\\b`, 'gi');
        
        const beforeReplace = processedText;
        processedText = processedText.replace(regex, entry.anonymized_code);
        
        // Log if replacement happened
        if (beforeReplace !== processedText) {
            const matches = beforeReplace.match(regex);
            console.log(`  ✅ Replaced "${entry.original_value}" → ${entry.anonymized_code} (${matches?.length || 0} times)`);
        } else {
            console.log(`  ⚠️ No match for "${entry.original_value}"`);
        }
    });
    
    console.log('🔒 Text AFTER anonymization (first 300 chars):');
    console.log(processedText.substring(0, 300));
    console.log('🔒 === ANONYMIZATION DEBUG END ===');
    
    return processedText;
}

/**
 * Restore original values from anonymization codes
 * @param {string} text - Text with anonymization codes
 * @param {array} anonymizationEntries - Array of {original_value, anonymized_code}
 * @returns {string} Text with original values restored
 */
function restoreFromAnonymizationCodes(text, anonymizationEntries) {
    if (!text || !anonymizationEntries || anonymizationEntries.length === 0) {
        console.log('⚠️ No restore: text empty or no entries');
        return text;
    }
    
    console.log('🔓 === RESTORE DEBUG START ===');
    console.log('🔓 Text BEFORE restore (first 300 chars):');
    console.log(text.substring(0, 300));
    
    let processedText = text;
    
    anonymizationEntries.forEach(entry => {
        // Exact match on code (escape special chars for safety)
        const escapedCode = entry.anonymized_code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedCode, 'g');
        
        const beforeRestore = processedText;
        processedText = processedText.replace(regex, entry.original_value);
        
        if (beforeRestore !== processedText) {
            const matches = beforeRestore.match(regex);
            console.log(`  ✅ Restored ${entry.anonymized_code} → "${entry.original_value}" (${matches?.length || 0} times)`);
        }
    });
    
    console.log('🔓 Text AFTER restore (first 300 chars):');
    console.log(processedText.substring(0, 300));
    console.log('🔓 === RESTORE DEBUG END ===');
    
    return processedText;
}

// ============================================
// PROJECT MEMORY - Pure transformation functions
// ============================================

/**
 * Build project memory mapping for AI prompt
 * @param {array} memoryData - Array of {memory_type, key, value}
 * @returns {object} {mapping: string, codeMap: object}
 */
function buildProjectMemoryMapping(memoryData) {
    if (!memoryData || memoryData.length === 0) {
        return { mapping: '', codeMap: {} };
    }
    
    const stakeholders = memoryData.filter(m => m.memory_type === 'stakeholder');
    const systems = memoryData.filter(m => m.memory_type === 'system');
    const goals = memoryData.filter(m => m.memory_type === 'goal');
    const decisions = memoryData.filter(m => m.memory_type === 'decision');
    
    let mappingText = '\n\n=== PROJEKTMINNE MAPPNING ===\n';
    const codeMap = {};
    
    // Stakeholders
    if (stakeholders.length > 0) {
        mappingText += '\nPERSONER (använd ALLTID dessa koder):\n';
        stakeholders.forEach((s, idx) => {
            const code = `{{STAKE_${idx + 1}}}`;
            const info = `${s.key} (${s.value})`;
            mappingText += `${code} = ${info}\n`;
            codeMap[code] = info;
            codeMap[s.key.toLowerCase()] = code;
        });
    }
    
    // Systems
    if (systems.length > 0) {
        mappingText += '\nSYSTEM (använd ALLTID dessa koder):\n';
        systems.forEach((s, idx) => {
            const code = `{{SYS_${idx + 1}}}`;
            const match = s.value.match(/^(.+?)\s*\((.+?)\)/);
            if (match) {
                const [, name, details] = match;
                mappingText += `${code} = ${name} (${details})\n`;
                codeMap[code] = `${name} (${details})`;
                codeMap[name.toLowerCase()] = code;
            } else {
                mappingText += `${code} = ${s.value}\n`;
                codeMap[code] = s.value;
                const firstWord = s.value.split(/\s+/)[0].toLowerCase();
                codeMap[firstWord] = code;
            }
        });
    }
    
    // Goals (for context, not replaced)
    if (goals.length > 0) {
        mappingText += '\nPROJEKTMÅL:\n';
        goals.forEach(g => {
            mappingText += `- ${g.value}\n`;
        });
    }
    
    // Decisions (for context, not replaced)
    if (decisions.length > 0) {
        mappingText += '\nVIKTIGA BESLUT:\n';
        decisions.forEach(d => {
            mappingText += `- ${d.value}\n`;
        });
    }
    
    mappingText += '\nVIKTIGT: \n';
    mappingText += '- Använd EXAKT koderna {{STAKE_X}} och {{SYS_X}} som de står här\n';
    mappingText += '- Om du ser PERSON_X, ORG_X, LOC_X eller ID_X i texten: använd dem UTAN {{}}\n';
    mappingText += '- Lägg ALDRIG till {{}} runt PERSON_X, ORG_X, LOC_X eller ID_X\n';
    mappingText += '- Exempel: "PERSON_1 arbetar" är KORREKT, inte "{{PERSON_1}} arbetar"\n';
    mappingText += '================================\n\n';
    
    console.log('🔑 Project memory mapping built:', mappingText);
    console.log('🔑 Code map:', codeMap);
    
    return { mapping: mappingText, codeMap };
}

/**
 * Replace names/systems with project memory codes
 * @param {string} text - Original text
 * @param {object} codeMap - Code mapping from buildProjectMemoryMapping
 * @returns {string} Text with project memory codes
 */
function replaceNamesWithCodes(text, codeMap) {
    if (!text || !codeMap) return text;
    
    let processedText = text;
    
    // Sort by length (longest first) to avoid partial matches
    const entries = Object.entries(codeMap)
        .filter(([key]) => !key.startsWith('{{')) // Only original names, not codes
        .sort((a, b) => b[0].length - a[0].length);
    
    entries.forEach(([name, code]) => {
        // Skip if name is an anonymization code pattern
        if (/^(PERSON|ORG|LOC|ID)_\d+$/.test(name)) {
            console.log(`  ⚠️ Skipping anonymization code: ${name}`);
            return;
        }
        
        // Escape special regex characters
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Case-insensitive replacement with word boundaries
        const regex = new RegExp(`\\b${escapedName}\\b`, 'gi');
        
        const beforeReplace = processedText;
        processedText = processedText.replace(regex, code);
        
        if (beforeReplace !== processedText) {
            const matches = beforeReplace.match(regex);
            console.log(`  ✅ Project memory: "${name}" → ${code} (${matches?.length || 0} times)`);
        }
    });
    
    console.log('📝 Text before project memory codes:', text.substring(0, 100));
    console.log('📝 Text after project memory codes:', processedText.substring(0, 100));
    
    return processedText;
}

/**
 * Replace project memory codes with full info
 * @param {string} text - Text with codes
 * @param {object} codeMap - Code mapping from buildProjectMemoryMapping
 * @returns {string} Text with full info
 */
function replaceCodesWithInfo(text, codeMap) {
    if (!text || !codeMap) return text;
    
    let processedText = text;
    
    // Replace codes with full info
    Object.entries(codeMap)
        .filter(([key]) => key.startsWith('{{')) // Only codes
        .forEach(([code, fullInfo]) => {
            const regex = new RegExp(code.replace(/[{}]/g, '\\$&'), 'g');
            processedText = processedText.replace(regex, fullInfo);
        });
    
    console.log('📝 Text before replacement:', text.substring(0, 100));
    console.log('📝 Text after replacement:', processedText.substring(0, 100));
    
    return processedText;
}

// ============================================
// PROTECTED BLOCKS - Pure transformation functions
// ============================================

/**
 * Extract protected blocks from text
 * @param {string} rawData - Original text with [[PROTECTED]]...[[/PROTECTED]] blocks
 * @returns {object} {cleanedData: string, blocks: array}
 */
function extractProtectedBlocks(rawData) {
    const blocks = [];
    const regex = /\[\[PROTECTED\]\]([\s\S]*?)\[\[\/PROTECTED\]\]/g;
    
    let match;
    let counter = 1;
    while ((match = regex.exec(rawData)) !== null) {
        blocks.push({
            id: `BLOCK_${counter}`,
            content: match[1].trim(),
            placeholder: `{{PROTECTED_BLOCK_${counter}}}`
        });
        counter++;
    }
    
    // Replace protected blocks with placeholders using direct regex replacement
    let cleanedData = rawData;
    const regex = /\[\[PROTECTED\]\]([\s\S]*?)\[\[\/PROTECTED\]\]/g;
    
    let counter = 1;
    cleanedData = cleanedData.replace(regex, (match, content) => {
        const placeholder = `\n{{PROTECTED_BLOCK_${counter}}}\n`;
        counter++;
        return placeholder;
    });
    
    console.log('🔒 Protected blocks extracted:', blocks.length);
    blocks.forEach(block => {
        console.log(`  - ${block.id}: ${block.content.substring(0, 50)}...`);
    });
    
    return { cleanedData, blocks };
}

/**
 * Merge protected blocks back into AI content
 * @param {string} aiContent - Content from AI with {{PROTECTED_BLOCK_X}} placeholders
 * @param {array} blocks - Array from extractProtectedBlocks
 * @returns {string} Content with protected blocks restored
 */
function mergeProtectedBlocks(aiContent, blocks) {
    if (!blocks || blocks.length === 0) return aiContent;
    
    let result = aiContent;
    
    blocks.forEach(block => {
        // Use regex with global flag to replace ALL occurrences
        const escapedPlaceholder = block.placeholder.replace(/[{}]/g, '\\$&');
        const regex = new RegExp(escapedPlaceholder, 'g');
        result = result.replace(regex, block.content);
    });
    
    console.log('🔓 Protected blocks merged:', blocks.length);
    
    return result;
}

// ============================================
// Export functions to global scope for app.js
// ============================================

window.SecurityFunctions = {
    // Anonymization
    generateAnonymizationCode,
    replaceWithAnonymizationCodes,
    restoreFromAnonymizationCodes,
    
    // Project Memory
    buildProjectMemoryMapping,
    replaceNamesWithCodes,
    replaceCodesWithInfo,
    
    // Protected Blocks
    extractProtectedBlocks,
    mergeProtectedBlocks
};

console.log('✅ Security functions loaded');

} // End guard block
