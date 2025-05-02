# Define normalisation function
# -----------------------------

def normalise(x, xmin, xmax, ymin, ymax)
  xrange = xmax - xmin
  yrange = ymax - ymin
  ymin + (x - xmin) * (yrange.to_f / xrange)
end


# Make a hash to store data for RR
# --------------------------------

data = {maxyear245: [13.73, 14.74, 14.87],
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
        }


# Choose season, tmin or tmax, ssp
# --------------------------------

temp = "min" #min or max
season = "summer" # year, spring, summer, autumn, winter
ssp = "585" # 245 or 585
chosen = (temp + season + ssp).to_sym  # Convert string to symbol
puts chosen


# Process data
# ------------

ndata = [] # Set up empty array

# Check if the key exists in the hash
if data.key?(chosen)
  data[chosen].each do |n|  # Loop over the actual array from the hash
    normalised_n = normalise(n, -5, 35, 26, 106)  # Normalise each datapoint
    ndata.push(normalised_n)  # Push the normalised value into the new array
  end
else
  puts "Error: #{chosen} not found in data!"
end

puts ndata  # Print the result

yearaverage = normalise(data[chosen][0], -5, 35, 26, 106) # Defines starting pitch based on baseline temp for that combination


# Play normalised data
# ------------------------
in_thread do
  use_synth :saw
  s = play yearaverage, sustain: 7, amp: 1
  ndata.each {|m| # Loop over the normalised data
    control s, note: m, slide: 1
    sleep 2
  }
end
