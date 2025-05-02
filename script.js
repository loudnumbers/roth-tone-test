// This file contains the JavaScript code that utilizes the Tone.js library to create and manipulate audio.

let synth = null; // Declare synth globally to stop playback

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

    // Add "Play Data" button
    const playDataButton = document.createElement('button');
    playDataButton.innerText = "Play Data";
    playDataButton.className = 'button';
    playbackDiv.appendChild(playDataButton);

    playDataButton.addEventListener('click', async () => {
        const temp = tempSelect.value;
        const season = seasonSelect.value;
        const ssp = sspSelect.value;
        chosen = `${temp}${season}${ssp}`;
        console.log("Chosen combination:", chosen);

        // Process data with the current chosen combination
        const result = processData(data, chosen);
        if (result) {
            const { ndata, yearaverage } = result;

            // Play normalized data
            await playNormalizedData(ndata, yearaverage);
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
async function playNormalizedData(ndata, yearaverage) {
    if (synth) {
        synth.dispose(); // Dispose of any existing synth to avoid conflicts
    }

    synth = new Tone.Synth().toDestination(); // Create a new synth
    const now = Tone.now();

    // Play the starting pitch
    synth.triggerAttack(yearaverage, now); // Sustain indefinitely

    // Use Tone.Part to schedule the notes
    const part = new Tone.Part((time, note) => {
        synth.set({ portamento: 1 }); // Slide effect
        synth.triggerAttack(note, time);
        console.log(note); // Log the note being played
    }, ndata.map((note, index) => [index * 2, note])); // Schedule notes 2 seconds apart

    part.start(now); // Start the part
    Tone.Transport.start(); // Start the transport

    // Stop the synth after the last note
    const totalDuration = ndata.length * 2 + 7; // Total duration (ndata length * 2 seconds + sustain)
    setTimeout(() => {
        synth.triggerRelease();
        part.stop(); // Stop the part
        Tone.Transport.stop(); // Stop the transport
    }, totalDuration * 1000);
}