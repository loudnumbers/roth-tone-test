// This file contains the JavaScript code that utilizes the Tone.js library to create and manipulate audio.

let synth = null; // Declare synth globally to stop playback
let filter = null; // Declare filter globally for dynamic cutoff adjustment

document.addEventListener('DOMContentLoaded', () => {
    // Default data
    const defaultData = `{
        maxyear245: [13.73, 14.74, 14.87],
        maxyear585: [13.73, 14.83, 15.48],
        maxspring245: [12.86, 13.54, 13.56],
        maxspring585: [12.86, 13.61, 14.01],
        maxsummer245: [20.58, 21.69, 21.81],
        maxsummer585: [20.58, 21.77, 22.51],
        maxautumn245: [14.07, 15.42, 15.70],
        maxautumn585: [14.07, 15.59, 16.48],
        maxwinter245: [7.25, 8.15, 8.28],
        maxwinter585: [7.25, 8.21, 8.78],
        minyear245: [5.81, 6.72, 6.82],
        minyear585: [5.81, 6.81, 7.35],
        minspring245: [4.36, 4.94, 4.96],
        minspring585: [4.36, 5.00, 5.36],
        minsummer245: [11.08, 12.07, 12.16],
        minsummer585: [11.08, 12.14, 12.64],
        minautumn245: [6.77, 8.01, 8.22],
        minautumn585: [6.77, 8.16, 8.92],
        minwinter245: [0.94, 1.77, 1.87],
        minwinter585: [0.94, 1.84, 2.40]
    }`;

    let data = JSON.parse(defaultData.replace(/(\w+):/g, '"$1":')); // Parse default data into an object
    let chosen = "minyear245"; // Default chosen combination

    // Create a button to trigger a note
    const playButton = document.createElement('button');
    playButton.innerText = 'Play Note';
    playButton.className = 'button'; // Add the button class
    document.getElementById("intro").appendChild(playButton);

    playButton.addEventListener('click', async () => {
        // Start the Tone.js context on user interaction
        await Tone.start();
        console.log('Tone.js is ready');
        
        // Play the note
        const tempSynth = new Tone.Synth().toDestination();
        tempSynth.triggerAttackRelease('C4', '8n');
    });

    // Create a text field and a button to save JSON data
    const textField = document.createElement('textarea');
    textField.placeholder = 'Paste JSON data here';
    textField.rows = 10;
    textField.cols = 50;
    textField.value = defaultData; // Preload the default data
    document.getElementById("data").appendChild(textField);

    const saveButton = document.createElement('button');
    saveButton.innerText = 'Save JSON';
    saveButton.className = 'button'; // Add the button class
    document.getElementById("data").appendChild(saveButton);

    saveButton.addEventListener('click', () => {
        try {
            // Replace Ruby-style symbols with valid JSON keys
            const validJsonText = textField.value.replace(/(\w+):/g, '"$1":');
            data = JSON.parse(validJsonText);
            console.log('Saved data:', data);

            // Process data with the current chosen combination
            processData(data, chosen);
        } catch (error) {
            console.error('Invalid JSON:', error.message);
        }
    });

    // Add dropdown selectors for temp, season, and ssp
    const playbackDiv = document.getElementById("dataplayback");

    // Temp dropdown
    const tempLabel = document.createElement('label');
    tempLabel.innerText = "Temperature (min/max): ";
    playbackDiv.appendChild(tempLabel);

    const tempSelect = document.createElement('select');
    tempSelect.name = "temp";
    ["min", "max"].forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.innerText = option;
        tempSelect.appendChild(opt);
    });
    playbackDiv.appendChild(tempSelect);

    // Season dropdown
    const seasonLabel = document.createElement('label');
    seasonLabel.innerText = " Season: ";
    playbackDiv.appendChild(seasonLabel);

    const seasonSelect = document.createElement('select');
    seasonSelect.name = "season";
    ["year", "spring", "summer", "autumn", "winter"].forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.innerText = option;
        seasonSelect.appendChild(opt);
    });
    playbackDiv.appendChild(seasonSelect);

    // SSP dropdown
    const sspLabel = document.createElement('label');
    sspLabel.innerText = " SSP: ";
    playbackDiv.appendChild(sspLabel);

    const sspSelect = document.createElement('select');
    sspSelect.name = "ssp";
    ["245", "585"].forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.innerText = option;
        sspSelect.appendChild(opt);
    });
    playbackDiv.appendChild(sspSelect);

    // Display chosen combination
    const comboButton = document.createElement('button');
    comboButton.innerText = "Save Combination";
    comboButton.className = 'button';
    playbackDiv.appendChild(comboButton);

    comboButton.addEventListener('click', () => {
        const temp = tempSelect.value;
        const season = seasonSelect.value;
        const ssp = sspSelect.value;
        chosen = `${temp}${season}${ssp}`;
        console.log("Chosen combination:", chosen);

        // Process data with the current chosen combination
        processData(data, chosen);
    });

    // Add a slider for filter cutoff
    const filterLabel = document.createElement('label');
    filterLabel.innerText = "Low-pass Filter Cutoff: ";
    playbackDiv.appendChild(filterLabel);

    const filterSlider = document.createElement('input');
    filterSlider.type = 'range';
    filterSlider.min = '100';
    filterSlider.max = '10000';
    filterSlider.value = '1000'; // Default cutoff frequency
    filterSlider.step = '100';
    playbackDiv.appendChild(filterSlider);

    const filterValue = document.createElement('span');
    filterValue.innerText = `${filterSlider.value} Hz`;
    playbackDiv.appendChild(filterValue);

    filterSlider.addEventListener('input', () => {
        filterValue.innerText = `${Math.round(filterSlider.value)} Hz`; // Display the rounded cutoff frequency
        if (filter) {
            filter.frequency.value = filterSlider.value; // Dynamically adjust the filter cutoff
        }
    });

    // Add "Play Data" button
    const playDataButton = document.createElement('button');
    playDataButton.innerText = "Play Data";
    playDataButton.className = 'button';
    playbackDiv.appendChild(playDataButton);

    playDataButton.addEventListener('click', async () => {
        const temp = document.querySelector('select[name="temp"]').value;
        const season = document.querySelector('select[name="season"]').value;
        const ssp = document.querySelector('select[name="ssp"]').value;
        chosen = `${temp}${season}${ssp}`;
        console.log("Chosen combination:", chosen);

        // Process data with the current chosen combination
        const result = processData(data, chosen);
        if (result) {
            const { ndata, yearaverage } = result;

            // Play normalized data
            await playNormalizedData(ndata, yearaverage, filterSlider.value);
        }
    });

    // Add "Stop Playback" button
    const stopPlaybackButton = document.createElement('button');
    stopPlaybackButton.innerText = "Stop Playback";
    stopPlaybackButton.className = 'button';
    playbackDiv.appendChild(stopPlaybackButton);

    stopPlaybackButton.addEventListener('click', () => {
        if (synth) {
            synth.triggerRelease(); // Stop the synth
            Tone.Transport.stop(); // Stop the transport
            console.log("Playback stopped.");
        }
    });

});

// Normalisation function
function normalise(x, xmin, xmax, ymin, ymax) {
    const xrange = xmax - xmin;
    const yrange = ymax - ymin;
    return ymin + (x - xmin) * (yrange / xrange);
}

// Process data function
function processData(data, chosen) {
    const ndata = []; // Set up empty array

    if (data.hasOwnProperty(chosen)) {
        // Loop over the actual array from the data object
        data[chosen].forEach(n => {
            const normalised_n = normalise(n, -5, 35, 26, 106); // Normalise each datapoint
            ndata.push(normalised_n); // Push the normalised value into the new array
        });

        console.log("Processed data:", ndata); // Print the result

        // Define starting pitch based on baseline temp for that combination
        const yearaverage = normalise(data[chosen][0], -5, 35, 26, 106);
        console.log("Year average (starting pitch):", yearaverage);

        return { ndata, yearaverage };
    } else {
        console.error(`Error: ${chosen} not found in data!`);
        return null;
    }
}

// Play normalized data function
async function playNormalizedData(ndata, yearaverage, cutoff) {
    if (synth) {
        synth.dispose(); // Dispose of any existing synth to avoid conflicts
    }
    if (filter) {
        filter.dispose(); // Dispose of any existing filter
    }

    // Create a low-pass filter
    filter = new Tone.Filter({
        type: "lowpass",
        frequency: cutoff, // Set initial cutoff frequency
        rolloff: -12,
        Q: 1,
    }).toDestination();

    // Create a new synth with a custom envelope and connect it to the filter
    synth = new Tone.Synth({
        oscillator: {
            type: "sawtooth", // You can change this to other waveforms like "sine", "square", etc.
        },
        envelope: {
            attack: 2, // Fade in over 2 seconds
            decay: 0.5,
            sustain: 1, // Sustain level
            release: 2, // Fade out over 2 seconds
        },
        portamento: 1, // Glide between notes over 1 second
    }).connect(filter);

    const now = Tone.now();

    // Start the synth with the first note (yearaverage)
    synth.triggerAttack(yearaverage, now);

    // Schedule the notes to glide to each one
    ndata.forEach((note, index) => {
        const time = now + index * 2; // 2 seconds between each note
        synth.setNote(note, time); // Glide to the next note
    });

    // Stop the synth after the last note
    const totalDuration = ndata.length * 2 + 5; // Total duration (ndata length * 2 seconds + sustain)
    setTimeout(() => {
        synth.triggerRelease(); // Fade out
        Tone.Transport.stop(); // Stop the transport
    }, totalDuration * 1000);
}