CREATE TABLE "cliente" (
  cel bigint PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL
);

CREATE TABLE "producto" (
  id int PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  cantidad INT NOT NULL,
  valor_uni FLOAT NOT NULL
);
CREATE TABLE "pedido" (
  cel_clien bigint NOT NULL,
  id_producto int NOT NULL,
  estado VARCHAR(50) DEFAULT 'Pendiente',
  total FLOAT,
  PRIMARY KEY(cel_clien,id_producto),
  FOREIGN KEY (cel_clien) REFERENCES cliente(cel),
  FOREIGN KEY (id_producto) REFERENCES producto(id)
);


INSERT INTO cliente (cel, nombre) VALUES 
(3001234567, 'Juan Perez'),
(3109876543, 'María Gomez'),
(3204567890, 'Luis Rodriguez'),
(3214942390, 'Daniela Rojas');


INSERT INTO producto (id, nombre, cantidad, valor_uni) VALUES 
(1, 'Arepas Boyasence', 800, 2500.0),
(2, 'Almojábana', 200, 2000.0),
(3, 'Pasteles De Yuca', 300, 3000.0),
(4, 'Empanadas de Maíz', 400, 1800.0),
(5, 'Queso con bocadillo', 100, 5000);


INSERT INTO pedido (cel_clien, id_producto, estado,total) VALUES 
(3001234567, 1, 'Pendiente',2500.0),
(3109876543, 2, 'Confirmado',2000.0),
(3204567890, 3, 'Pendiente',3000.0), 
(3001234567, 4, 'Entregado',180.0),
(3214942390, 5, 'Pendiente',5000.0); 