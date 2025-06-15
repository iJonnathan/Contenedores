-- Creo la base de datos si no existe
CREATE DATABASE IF NOT EXISTS fintech;

-- Uso la base creada
USE fintech;

-- Creo la tabla accounts
CREATE TABLE IF NOT EXISTS accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    balance DECIMAL(10, 2) NOT NULL
);

-- Inserto un registro de ejemplo
INSERT INTO accounts (name, balance) VALUES
('Jonnathan Peñaranda', 1500.50);