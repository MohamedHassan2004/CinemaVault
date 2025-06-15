using CinemaVault.DAL.Context;
using CinemaVault.DAL.IRepository;
using CinemaVault.DAL.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CinemaVault.DAL.Repository
{
    public class ReviewRepository : Repository<Review>, IReviewRepository
    {

        private readonly CinemaVaultDbContext _context;

        public ReviewRepository(CinemaVaultDbContext context) : base(context)
        {
            _context = context;
        }

     
        public async Task<IEnumerable<Review>> GetReviewByMovieId(int MovieId)
        {
            return await _context.Reviews.Where(m => m.MovieId == MovieId).ToListAsync();
        }

    }
}
