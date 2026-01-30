const N_PARTICLES = 100;
const PARTICLE_RADIUS = 13;
const ELECTRIC_CONSTANT = 100000.0;
const DELTA_T = 0.1;
const MIN_DIST = 1e-2;
const MAX_VELOCITY = 10000.0;

function init_particles(n_particles, width, height) {
	var particles = new Array();
	for (var i = 0; i < n_particles; ++i) {
		var particle = document.createElement("div");
		particle.classList.add("circle");
		particle.left_pos = Math.floor(Math.random() * width);
		particle.top_pos = Math.floor(Math.random() * height);
		particle.left_vel = 0;
		particle.top_vel = 0;
		particle.left_force = 0;
		particle.top_force = 0;
		particle.style.left = particle.left_pos + "px";
		particle.style.top = particle.top_pos + "px";
		if (i % 3 == 0) {
			particle.style.background = "red";
			particle.style.color = "black";
			particle.style.border = "3px solid red";
			particle.textContent = "+";
			particle.charge = 2;
		}
		else {
			particle.style.background = "blue";
			particle.style.color = "white";
			particle.style.border = "3px solid blue";
			particle.textContent = "-";
			particle.charge = -1;
		}
		document.querySelector(".container").appendChild(particle);
		particles.push(particle);
	}
	return particles;
}

function calculate_force(particle_id, particles, width, height) {
	var particle = particles[particle_id];
	var part_x = particle.left_pos + PARTICLE_RADIUS;
	var part_y = particle.top_pos + PARTICLE_RADIUS;
	particle.left_force = 0.0;
	particle.top_force = 0.0;
	for (var i = 0; i < particles.length; ++i) {
		if (i == particle_id) {
			continue;
		}
		var other = particles[i];
		var other_x = other.left_pos + PARTICLE_RADIUS;
		var other_y = other.top_pos + PARTICLE_RADIUS;
		var dx = part_x - other_x;
		var dy = part_y - other_y;
		var dist = Math.sqrt(dx**2 + dy**2)
		var prefactor = ELECTRIC_CONSTANT * particle.charge * other.charge;
		if (prefactor < 0 && dist <= 2 * PARTICLE_RADIUS) {
			continue;
		}
		if (dist <= MIN_DIST) {
			dist = MIN_DIST;
		}
		var force_x = prefactor * dx / dist**3;
		var force_y = prefactor * dy / dist**3;
		particle.left_force += force_x;
		particle.top_force += force_y;
	}
	if (particle.left_pos <= 0) {
		particle.left_force += 100.0;
	}
	else if (particle.left_pos >= width) {
		particle.left_force -= 100.0;
	}
	if (particle.top_pos <= 0) {
		particle.top_force += 100.0;
	}
	else if (particle.top_pos >= height) {
		particle.top_force -= 100.0;
	}
}

function velocity_verlet(particles, prev_left_forces, prev_top_forces, width,
height) {
	for (var particle of particles) {
		particle.left_pos += Math.round(particle.left_vel * DELTA_T +
			0.5 * particle.left_force * DELTA_T**2);
		if (particle.left_pos < 0) {
			particle.left_pos = 0;
		}
		else if (particle.left_pos > width) {
			particle.left_pos = width;
		}
		particle.top_pos += Math.round(particle.top_vel * DELTA_T +
			0.5 * particle.top_force * DELTA_T**2);
		if (particle.top_pos < 0) {
			particle.top_pos = 0;
		}
		else if (particle.top_pos > height) {
			particle.top_pos = height;
		}
		particle.style.left = particle.left_pos + "px";
		particle.style.top = particle.top_pos + "px";
	}
	for (var i = 0; i < particles.length; ++i) {
		calculate_force(i, particles, width, height);
	}
	for (var i = 0; i < particles.length; ++i) {
		var particle = particles[i];
		particle.left_vel += 0.5 * (prev_left_forces[i] + particle.left_force) *
			DELTA_T;
		particle.top_vel += 0.5 * (prev_top_forces[i] + particle.top_force) *
			DELTA_T;
		if (particle.left_vel > MAX_VELOCITY) {
			particle.left_vel = MAX_VELOCITY;
		}
		if (particle.top_vel > MAX_VELOCITY) {
			particle.top_vel = MAX_VELOCITY;
		}
		prev_left_forces[i] = particle.left_force;
		prev_top_forces[i] = particle.top_force;
	}
}

function sleep(time) {
	return new Promise(function(resolve) {return setTimeout(resolve, time);});
}

async function main() {
	var width = window.innerWidth - 26;
	var height = window.innerHeight - 26;
	var particles = init_particles(N_PARTICLES, width, height);
	var prev_left_forces = new Array(N_PARTICLES).fill(0);
	var prev_top_forces = new Array(N_PARTICLES).fill(0);
	while (true) {
		velocity_verlet(particles, prev_left_forces, prev_top_forces, width,
			height);
		await sleep(50);
	}
}

window.onload = main();
