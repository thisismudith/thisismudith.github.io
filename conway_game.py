import random

# Define the size of the grid
GRID_WIDTH = 3
GRID_HEIGHT = 3

# Surrounding cells
TRANSFORMATION = [(-1, -1), (0, -1), (1, -1), (-1, 0), (1, 0), (-1, 1), (0, 1), (1, 1)] # (x, y)    


# Printing the grid
def print_grid(grid: list[list[str]]):
    for row in grid:
        print(" ".join(row))


# Updating the grid values (populating)
def populate_grid(grid: list[list[str]] = [], cells: list[tuple[int, int]] = []): # cells: [(x, y)]
    # Create an empty grid
    if (len(grid) == 0):
        grid = [[" "] * GRID_WIDTH for _ in range(GRID_HEIGHT)]

    # Populate based upon cell enteries
    if len(cells) > 0:
        for cell in cells:
            grid[cell[1]][cell[0]] = "■"

    # Randomly populate the grid with live cells
    else:
        for i in range(GRID_HEIGHT):
            for j in range(GRID_WIDTH):
                grid[i][j] = random.choice([" ", "■"])

    return grid


# Count the number of live cells around a cell
def count_live_cells(grid: list[list[str]], x: int, y: int) -> int:
    count = 0
    for dx, dy in TRANSFORMATION:
        new_x = x + dx
        new_y = y + dy
        if new_x >= 0 and new_x < GRID_WIDTH and new_y >= 0 and new_y < GRID_HEIGHT:
            if grid[new_y][new_x] == "■":
                count += 1
    return count


# Update the grid based on the rules of Conway's game of Life
def conway_grid_of_life(grid: list[list[str]]) -> list[list[str]]:
    new_grid = [[" "] * GRID_WIDTH for _ in range(GRID_HEIGHT)]
    for i in range(GRID_HEIGHT):
        for j in range(GRID_WIDTH):
            count = count_live_cells(grid, j, i)
            # print(j, i, count)
            if grid[i][j] == "■":
                if count < 2 or count > 3:
                    new_grid[i][j] = " "
                else:
                    new_grid[i][j] = "■"
            else:
                if count == 3:
                    new_grid[i][j] = "■"
    return new_grid


# Reversing the Conway's Game of Life


grid = populate_grid(cells=[(0, 1), (1, 1), (2, 1)])
for i in range(10):
    print("Generation", i)
    print_grid(grid)
    print()
    grid = conway_grid_of_life(grid)