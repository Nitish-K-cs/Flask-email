from config import db

class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fname = db.Column(db.String(100), nullable=False)
    lname = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    #message = db.Column(db.Text, nullable=False)

    def to_json(self):
        return {
            'id': self.id,
            'firstName': self.fname,
            'lastName': self.lname,
            'email': self.email
        }