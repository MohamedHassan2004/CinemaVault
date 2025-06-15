namespace CinemaVault.DAL.Models.Users
{
    public class RegUser : ApplicationUser
    {
        public ICollection<SavedMovie> SavedMovies { get; set; } = new List<SavedMovie>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}
