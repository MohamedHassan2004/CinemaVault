using CinemaVault.DAL.Models;
using CinemaVault.DAL.Models.Users;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CinemaVault.DAL.Context
{
    public class CinemaVaultDbContext : IdentityDbContext<ApplicationUser>
    {
        public CinemaVaultDbContext(DbContextOptions<CinemaVaultDbContext> options) : base(options)
        {
        }

        public DbSet<RegUser> RegUsers { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<Movie> Movies { get; set; }
        public DbSet<Genre> Genres { get; set; }
        public DbSet<GenreMovie> GenreMovies { get; set; }
        public DbSet<SavedMovie> SavedMovies { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<UserPermission> UserPermissions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);


            // data seeding , data initializer

            // Seed Genres
            modelBuilder.Entity<Genre>().HasData(
                new Genre { Id = 1, Name = "Action" },
                new Genre { Id = 2, Name = "Drama" },
                new Genre { Id = 3, Name = "Comedy" },
                new Genre { Id = 4, Name = "Thriller" },
                new Genre { Id = 5, Name = "Sci-Fi" }
            );

            // Seed Movies
            modelBuilder.Entity<Movie>().HasData(
                new Movie
                {
                    Id = 1,
                    Title = "Inception",
                    Description = "Dream invasion",
                    PosterUrl = "inception.jpg",
                    TrailerUrl = "https://www.youtube.com/watch?v=YoHD9XEInc0",
                    DirectorName = "Christopher Nolan",
                },
                new Movie
                {
                    Id = 2,
                    Title = "The Dark Knight",
                    Description = "Batman vs Joker",
                    PosterUrl = "dark_knight.jpg",
                    TrailerUrl = "https://www.youtube.com/watch?v=EXeTwQWrcwY",
                    DirectorName = "Christopher Nolan",
                },
                new Movie
                {
                    Id = 3,
                    Title = "Forrest Gump",
                    Description = "Life journey",
                    PosterUrl = "forrest_gump.jpg",
                    TrailerUrl = "https://www.youtube.com/watch?v=bLvqoHBptjg",
                    DirectorName = "Robert Zemeckis",
                }
            );
        }

    }
}
